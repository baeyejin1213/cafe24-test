#!/usr/bin/env node
// 기획전 폴더의 html을 카페24 없이 열리는 미리보기 페이지로 바꿉니다.
//   node build-preview.mjs <기획전 폴더> <출력 폴더> [--self-contained]
//
// 출력
//   index.html / pc.html / mo.html   브라우저에서 바로 여는 전체 문서
//   artifact*.html                    Claude 아티팩트용 조각(문서 골격 없이)  — --self-contained 일 때
//   images/                           받아둔 이미지 복사본
//   build.json                        빌드 정보(이미지 수 등)
//
// 하는 일
// - @layout/@import 주석 제거, 미리보기 안내 띠 추가
// - images.json에 있는 이미지 절대 경로(/morenvyimg/... 등)를 images/<파일>로 치환
// - 스킨에만 있는 Swiper·imageMapResizer 스크립트를 CDN으로 치환
// - 카페24 스킨 기본 html font-size(62.5%, 도메인별 구간)를 흉내 냄
// - --self-contained: 아티팩트에서 막히는 외부 CSS·폰트·스크립트를 받아 페이지 안에 넣음 (인터넷 필요, GitHub Actions에서 실행)

import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const selfContained = args.includes("--self-contained");
const [srcDir, outDir] = args.filter((a) => !a.startsWith("--"));
if (!srcDir || !outDir) { console.error("사용법: node build-preview.mjs <기획전 폴더> <출력 폴더> [--self-contained]"); process.exit(1); }
const folder = path.basename(path.resolve(srcDir));
const exists = async (p) => fs.access(p).then(() => true, () => false);

// 메타 정보: meta.json(예약 작업이 씀) → 없으면 README에서
let meta = {};
if (await exists(path.join(srcDir, "meta.json"))) meta = JSON.parse(await fs.readFile(path.join(srcDir, "meta.json"), "utf8"));
if (!meta.domain && await exists(path.join(srcDir, "README.md"))) {
  const readme = await fs.readFile(path.join(srcDir, "README.md"), "utf8");
  meta.domain = (readme.match(/이식할 도메인:\s*`?([^\s`]+)/) || [])[1] || "";
}
const domain = (meta.domain || "").toLowerCase();

// 이미지 목록
let imageFiles = [];
if (await exists(path.join(srcDir, "images.json"))) {
  const m = JSON.parse(await fs.readFile(path.join(srcDir, "images.json"), "utf8"));
  imageFiles = (m.images || []).map((i) => i.file.replace(/\\/g, "/"));
}
const present = new Set();
async function walk(d, rel = "") {
  for (const e of await fs.readdir(d, { withFileTypes: true }).catch(() => [])) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) await walk(path.join(d, e.name), r); else present.add(r);
  }
}
await walk(path.join(srcDir, "images"));
for (const f of present) if (!imageFiles.includes(f)) imageFiles.push(f);
const byLength = [...imageFiles].sort((a, b) => b.length - a.length);
const toLocal = (abs) => byLength.find((f) => abs === "/" + f || abs.endsWith("/" + f));

const FONT_PRESETS = {
  legodt: "html{font-size:62.5%}\n@media (max-width:1024px){html{font-size:81.25%}}\n@media (max-width:767px){html{font-size:75%}}\n@media (max-width:575px){html{font-size:68.75%}}",
  base: "html{font-size:62.5%}\n@media (min-width:576px) and (max-width:767px){html{font-size:72.5%}}",
};
const fontCss = domain.includes("legodt") ? FONT_PRESETS.legodt : FONT_PRESETS.base;

const SWIPER_JS = "https://cdn.jsdelivr.net/npm/swiper@11.1.9/swiper-bundle.min.js";
const SWIPER_CSS = "https://cdn.jsdelivr.net/npm/swiper@11.1.9/swiper-bundle.min.css";
const IMGMAP_JS = "https://cdn.jsdelivr.net/npm/image-map-resizer@1.0.10/js/imageMapResizer.min.js";

// 아티팩트 CSP가 허용하는 곳
const SCRIPT_OK = [/^https:\/\/cdnjs\.cloudflare\.com\//, /^https:\/\/cdn\.jsdelivr\.net\/npm\//, /^https:\/\/unpkg\.com\//, /^https:\/\/code\.jquery\.com\//, /^https:\/\/cdn\.tailwindcss\.com\//];
const STYLE_OK = [/^https:\/\/fonts\.googleapis\.com\//];
const MIME = { woff2: "font/woff2", woff: "font/woff", ttf: "font/ttf", otf: "font/otf", eot: "application/vnd.ms-fontobject", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };
const warnings = [];

async function get(url, as = "text") {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 cafe24-preview" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return as === "text" ? res.text() : Buffer.from(await res.arrayBuffer());
}
async function inlineCss(css, baseUrl) {
  const urls = [...new Set([...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map((m) => m[2]).filter((u) => !u.startsWith("data:")))];
  for (const u of urls) {
    try {
      const abs = new URL(u, baseUrl).href;
      const ext = (abs.split("?")[0].split(".").pop() || "").toLowerCase();
      const buf = await get(abs, "buf");
      css = css.split(u).join(`data:${MIME[ext] || "application/octet-stream"};base64,${buf.toString("base64")}`);
    } catch (e) { warnings.push(`CSS 안 파일을 못 받음: ${u} (${e.message})`); }
  }
  return css;
}
async function makeSelfContained(html) {
  // jQuery는 허용된 CDN 주소로
  html = html.replace(/https?:\/\/ajax\.googleapis\.com\/ajax\/libs\/jquery\/([\d.]+)\/jquery(\.min)?\.js/gi, "https://code.jquery.com/jquery-$1$2.js");
  // 허용 안 된 스타일시트 → <style>
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (!/rel=["']?stylesheet/i.test(tag)) continue;
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1];
    if (!href || !/^https?:/i.test(href) || STYLE_OK.some((r) => r.test(href))) continue;
    try { html = html.replace(tag, `<style>/* ${href} */\n${await inlineCss(await get(href), href)}\n</style>`); }
    catch (e) { warnings.push(`스타일시트를 못 받음: ${href} (${e.message})`); }
  }
  // 허용 안 된 외부 스크립트 → 인라인
  for (const tag of html.match(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>\s*<\/script>/gi) || []) {
    const src = tag.match(/src=["']([^"']+)["']/i)[1];
    if (!/^https?:/i.test(src) || SCRIPT_OK.some((r) => r.test(src))) continue;
    try { html = html.replace(tag, `<script>/* ${src} */\n${(await get(src)).replace(/<\/script/gi, "<\\/script")}\n</script>`); }
    catch (e) { warnings.push(`스크립트를 못 받음: ${src} (${e.message})`); }
  }
  return html;
}

const pages = [];
for (const name of ["project.html", "pc.html", "mo.html"]) {
  if (!(await exists(path.join(srcDir, name)))) continue;
  let html = await fs.readFile(path.join(srcDir, name), "utf8");
  html = html.replace(/<!--\s*@(layout|import)\([^)]*\)\s*-->\s*/g, "");

  const used = new Set();
  html = html.replace(/(["'(\s,])(\/[^"'()\s,]+\.(?:webp|png|jpe?g|gif|svg|avif|mp4))/gi, (all, pre, abs) => {
    const f = toLocal(abs);
    if (!f) return all;
    used.add(f);
    return `${pre}images/${f}`;
  });

  let needSwiperCss = false;
  html = html.replace(/<script\b([^>]*?)src=["']([^"']*swiper[^"']*\.js)["']([^>]*)><\/script>/gi, (all, a, src, b) => {
    if (/^https?:/i.test(src)) return all;
    needSwiperCss = true;
    return `<script${a}src="${SWIPER_JS}"${b}></script>`;
  });
  html = html.replace(/<link\b([^>]*?)href=["']\/[^"']*swiper[^"']*\.css["']([^>]*)>/gi, `<link$1href="${SWIPER_CSS}"$2>`);
  html = html.replace(/<script\b([^>]*?)src=["']\/[^"']*imageMapResizer[^"']*\.js["']([^>]*)><\/script>/gi, `<script$1src="${IMGMAP_JS}"$2></script>`);
  if (needSwiperCss) html = `<link rel="stylesheet" href="${SWIPER_CSS}">\n` + html;

  const total = used.size, shown = [...used].filter((f) => present.has(f)).length;
  const label = name === "pc.html" ? "PC" : name === "mo.html" ? "MO" : "반응형";
  const imgNote = total ? ` · 이미지 ${shown}/${total}장` + (shown < total ? " (나머지는 아직 피그마에서 받지 않음)" : "") : "";
  const bar = `<div class="cf24-preview-bar"><b>미리보기 · ${label}</b><span>카페24 레이아웃·헤더·스킨 CSS 없이 표시${domain ? " · " + domain + " 기준 글자 크기" : ""}${imgNote}</span></div>`;
  const style = `<style>
${fontCss}
html{color-scheme:light}
body{margin:0;background:#fff;color:#000;font-family:"Pretendard","Apple SD Gothic Neo","Malgun Gothic",sans-serif;font-size:1.4rem;}
ul,ol{margin:0;padding:0;}
.cf24-preview-bar{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center;padding:8px 16px;background:#1b1f2a;color:#e8eaf0;font:12px/1.5 system-ui,sans-serif;}
.cf24-preview-bar b{color:#fff;font-weight:600;}
</style>`;
  const body = `${bar}\n<div id="wrap"><div id="container"><div id="contents">\n${html}\n</div></div></div>`;
  const title = `${meta.brand ? meta.brand + " " : ""}${meta.title || folder}${name === "project.html" ? "" : " " + label} 미리보기`;
  const outName = name === "project.html" ? "index.html" : name;

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, outName),
    `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title}</title>\n${style}\n</head>\n<body>\n${body}\n</body>\n</html>\n`);
  if (selfContained) {
    const art = await makeSelfContained(`<title>${title}</title>\n${style}\n${body}\n`);
    await fs.writeFile(path.join(outDir, outName.replace(/^index/, "artifact").replace(/^(pc|mo)\.html$/, "artifact-$1.html")), art);
  }
  pages.push({ file: outName, label, images: total, imagesReady: shown });
  console.log(`✓ ${outName}  이미지 ${shown}/${total}`);
}
if (!pages.length) { console.error("project.html / pc.html / mo.html 이 없어요."); process.exit(1); }

for (const f of present) {
  const to = path.join(outDir, "images", f);
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(path.join(srcDir, "images", f), to);
}
await fs.writeFile(path.join(outDir, "build.json"), JSON.stringify({
  folder, domain, pages, warnings,
  branch: process.env.GITHUB_REF_NAME || "", triggerSha: process.env.GITHUB_SHA || "", sourceSha: process.env.SOURCE_SHA || "",
  builtAt: new Date().toISOString(),
}, null, 2));
for (const w of warnings) console.warn("! " + w);
