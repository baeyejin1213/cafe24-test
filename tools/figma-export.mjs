#!/usr/bin/env node
// 기획전 폴더의 images.json을 읽어 피그마 노드를 PNG로 받아 WebP로 저장합니다.
//
// 사용법 (내 컴퓨터에서):
//   cd tools && npm install
//   FIGMA_TOKEN=figd_xxx node figma-export.mjs ../promotions/261021_MerryLoop
//   (Windows PowerShell)  $env:FIGMA_TOKEN="figd_xxx"; node figma-export.mjs ..\promotions\261021_MerryLoop
//
// images.json 형식:
// {
//   "fileKey": "AbCdEf123",
//   "images": [
//     { "file": "pc/kv.webp", "nodeId": "136:2347", "scale": 1 },
//     { "file": "m/kv.webp",  "nodeId": "136:2142", "scale": 3, "quality": 90 },
//     { "file": "pc/sec01.webp", "nodeId": "136:2400", "scale": 2, "crop": { "left": 0, "top": 0, "width": 1920, "height": 900 } }
//   ]
// }
// - file: images/ 아래 저장 경로
// - scale: 피그마 export 배율 (최대 4)
// - crop: export된 PNG 픽셀 기준으로 잘라낼 영역 (선택)
// - quality: WebP 품질 (기본 85)

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const dir = process.argv[2];
const token = process.env.FIGMA_TOKEN;
if (!dir) { console.error("기획전 폴더 경로를 넣어주세요. 예: node figma-export.mjs ../promotions/261021_MerryLoop"); process.exit(1); }
if (!token) { console.error("FIGMA_TOKEN 환경변수가 없어요. 피그마 설정 > Security > Personal access tokens에서 만들 수 있어요."); process.exit(1); }

const manifest = JSON.parse(await fs.readFile(path.join(dir, "images.json"), "utf8"));
const outRoot = path.join(dir, "images");
const byScale = new Map();
for (const img of manifest.images) {
  const s = img.scale || 1;
  if (!byScale.has(s)) byScale.set(s, []);
  byScale.get(s).push(img);
}

async function figmaUrls(ids, scale) {
  const url = `https://api.figma.com/v1/images/${manifest.fileKey}?ids=${encodeURIComponent(ids.join(","))}&scale=${scale}&format=png`;
  const res = await fetch(url, { headers: { "X-Figma-Token": token } });
  if (!res.ok) throw new Error(`피그마 API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.err) throw new Error(`피그마 API 오류: ${json.err}`);
  return json.images;
}

let ok = 0, fail = 0;
for (const [scale, list] of byScale) {
  for (let i = 0; i < list.length; i += 10) {
    const chunk = list.slice(i, i + 10);
    const urls = await figmaUrls([...new Set(chunk.map((c) => c.nodeId))], scale);
    await Promise.all(chunk.map(async (img) => {
      try {
        const src = urls[img.nodeId];
        if (!src) throw new Error("이미지 URL이 없어요 (노드가 숨김이거나 삭제됨)");
        const res = await fetch(src);
        if (!res.ok) throw new Error(`다운로드 ${res.status}`);
        let pipe = sharp(Buffer.from(await res.arrayBuffer()));
        if (img.crop) pipe = pipe.extract(img.crop);
        const out = path.join(outRoot, img.file);
        await fs.mkdir(path.dirname(out), { recursive: true });
        await pipe.webp({ quality: img.quality || 85, alphaQuality: 100, effort: 6 }).toFile(out);
        const { width, height } = await sharp(out).metadata();
        console.log(`✓ ${img.file}  ${width}×${height}`);
        ok++;
      } catch (e) {
        console.error(`✗ ${img.file} (${img.nodeId}): ${e.message}`);
        fail++;
      }
    }));
  }
}
console.log(`\n완료 ${ok}장, 실패 ${fail}장 → ${outRoot}`);
if (fail) process.exit(1);
