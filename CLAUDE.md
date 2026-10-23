# 기획전 코딩 규칙

이 저장소는 카페24 기획전 페이지 코드를 모아두는 곳입니다.
기획전 코딩 보드(https://claude.ai/artifact/WeQHbvEjj7G7sDKwabnDuF)에서 "코딩 요청"된 건을
예약 작업이 가져와 피그마 기획안·시안을 읽고 코딩한 뒤 PR로 올립니다.

## 기준이 되는 skill

코딩 방식은 **aurorallee/cafe24-training** 저장소의 skill을 그대로 따릅니다. 작업할 때마다 최신 버전을 읽습니다.

- `.claude/skills/cafe24-promotion-page/SKILL.md` — 기획전 페이지 플레이북 (주 기준)
- `.claude/skills/cafe24-figma-to-skin/SKILL.md` 1장 — 피그마 값 읽기·에셋·폰트 대체
- `.claude/skills/cafe24-skin-clone/SKILL.md` 0장, `reference/cafe24-module-reference.md` — 카페24 구조·모듈

이 문서와 skill이 부딪히면 skill을 따릅니다. 이 문서는 보드 항목을 skill에 연결하는 방법과,
작업 환경 때문에 skill대로 할 수 없는 부분만 다룹니다.

## 보드 항목 → skill

| 보드 항목 | 쓰는 곳 |
|---|---|
| 브랜드 | 브랜드별 장(13~23장)의 규칙과 이전 사례 |
| 반응형 여부 | 반응형 한 장(1024px 기준, 1장) / PC·MO 따로(`pc.html`·`mo.html`, 이미지 `pc/`·`m/`) |
| 작업 방식 | 하나하나 코딩(1~11장) / 통이미지(12장). skill의 "시작 전에 물어볼 것"을 이 값으로 대신함 |
| 기획안 프레임 | 기획서 읽기(시작 전 2·3번, 13-2, 16-2: 파란 코멘트만 반영) |
| 시안 프레임 | PC·MO 프레임과 옆 상태 프레임 |
| 참고 페이지 | 13-1 참고 페이지 구조·주석량 따르기, 16-1 기획전관리자 앱 주입 |
| 이식할 도메인 | 13-6·14·22-5·23-5 도메인 이식 확인 |
| 프로모션 시작일 | 이미지 폴더 YYMMDD (없으면 작업일) |
| 이미지 경로 | 비어 있으면 skill에 그 도메인 규칙이 있으면 그대로, 없으면 `/morenvyimg/promotion/YYMMDD_Title/`로 두고 확인 필요에 적음 |
| 특히 신경써야 할 부분 | 사용자 지시로 취급해 skill 규칙보다 우선 |

## 폴더 구조

```
promotions/<YYMMDD_Title>/
  project.html          반응형 한 장  (또는 pc.html + mo.html)
  images.json           피그마 이미지 export 목록 (tools/figma-export.mjs 입력)
  README.md             적용 방법, 업로드할 이미지, 반영한 기획안 코멘트, 확인 필요
```

폴더 이름은 skill 1장의 이미지 폴더 이름 규칙(YYMMDD + PascalCase 타이틀)과 같게 맞춥니다.

## 작업 환경 차이 (예약 작업은 클라우드에서 실행)

클라우드 작업 환경은 피그마 이미지 서버, 브랜드 사이트, 찰나 CDN에 직접 접속할 수 없습니다.

- **이미지**: 이미지 파일은 직접 받지 않고 `images.json`에 `{file, nodeId, scale, crop}`을 적습니다.
  배율·WebP 규칙은 skill 1장 그대로. 사용자가 `tools/figma-export.mjs`로 받아서 올립니다.
  오버레이를 지운 임시 복제본이 필요하면(13-3, 12-2) `use_figma`로 `TMP_EXPORT_<폴더명>_<라벨>` 노드를 만들어 그 노드 ID를 적고,
  README에 "export 후 삭제할 임시 노드" 목록을 남깁니다. 원본 노드는 수정하지 않습니다.
- **참고 페이지·이식 도메인**: `curl` 대신 WebFetch로 읽을 수 있는 만큼 구조를 참고합니다.
  원본 HTML·사이트 CSS를 받아 대조하는 단계(13-1, 16-1, 도메인 전역 클래스 확인)를 못 했다면 README 확인 필요에 적습니다.
- **레이아웃 경로**: 스킨 파일을 볼 수 없으므로 `<!--@layout(/layout/basic/layout.html)-->`로 두고 확인 필요에 적습니다.
- **배포·라이브 검증(SFTP, Playwright)**: 하지 않습니다. README에 업로드할 파일과 확인할 항목(skill 11장 체크리스트 중 라이브에서만 확인 가능한 것)을 적습니다.
- 찰나 영상 URL(`curl -sIL` 확인)도 확인 필요로 남깁니다.

## 작업 방식

- 브랜치 `promo/<폴더명>`, PR 제목 `[기획전] <브랜드> <기획전 이름>`.
- 추가 수정 요청은 같은 브랜치에 커밋하고 기존 PR에 코멘트로 반영 내용을 남깁니다.
- 기획안과 시안이 다르면 skill대로 시안을 따르고 README에 근거와 함께 적습니다.
- 커밋 메시지 끝: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
