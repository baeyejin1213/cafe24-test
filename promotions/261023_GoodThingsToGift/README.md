# 레고트 추석 프로모션 — Good Things To Gift (261023_GoodThingsToGift)

- 보드: https://claude.ai/artifact/WeQHbvEjj7G7sDKwabnDuF
- 기획안: https://www.figma.com/design/MvBLtpEKFOFoxUpwjdkyGe/?node-id=163-2369
- 시안: https://www.figma.com/design/MvBLtpEKFOFoxUpwjdkyGe/?node-id=163-7717
  (PC `163:5118` 1920 · MO `163:3630` 360 · KV 2·3번 컷 PC `163:7667`/`163:7691` · MO `163:5045`/`163:5022` · 유의사항 펼침 `PC_Notice_01/02` `163:5092`/`163:5068` · `Notice_01/02` `163:5105`/`163:5080`)
- 참고 페이지: https://legodtofficial.cafe24.com/shop1/product/project.html?cate_no=291
- 이식할 도메인: legodtofficial.cafe24.com
- 작업 방식: 하나하나 코딩, 반응형 한 장(1024px 기준) — skill 1~11장 + 레고트 15·16·23장 규칙(rem + vw `clamp()`, 미디어쿼리 1개, fadeEl 한 번만 재생)

## 적용 방법

1. `project.html`을 기획전 페이지(예: `/project_goodthings.html`)로 올립니다. 첫 줄은 `<!--@layout(/layout/basic/layout.html)-->`입니다.
2. 이미지를 받아 `/morenvyimg/promotion/261023_GoodThingsToGift/`에 올립니다(아래 31장).
3. `<!-- 하위상품진열 상단 -->` 블록 5개(`#pj_cate01`~`#pj_cate05`)는 카테고리별 상품 진열 위에 붙는 문구입니다.
   기획전관리자 앱의 카테고리별 상단 HTML로 넣을 경우 블록째 옮기면 되고, id는 그대로 둬야 상단 썸네일 앵커가 동작합니다.

## 이미지 받기

```
cd tools && npm install
FIGMA_TOKEN=figd_xxx node figma-export.mjs ../promotions/261023_GoodThingsToGift
```

배율: PC 1000px 미만 2배 · 1000px 이상 1배, MO 360 기준 3배, 전부 WebP. 반응형 한 장이라 `pc/`·`m/` 폴더 없이 `_pc`/`_m` 접미사.

| 파일 | 노드 | 배율 |
|---|---|---|
| kv01~03_pc.webp | 163:5121 · 163:7668 · 163:7692 | 1 |
| kv01~03_m.webp | 163:3633 · 163:5046 · 163:5023 | 3 |
| kv_title.webp (투명) | 163:5124 | 2 |
| cate01~05_pc.webp | 163:5167 · 5177 · 5185 · 5194 · 5202 | 2 |
| cate01~05_m.webp | 163:3682 · 3691 · 3699 · 3708 · 3716 | 3 |
| gift01_pc / gift02_pc | 163:5219 / 168:2534(임시) | 2 |
| gift01_m / gift02_m | 163:3734 / 168:2541(임시) | 3 |
| mileage_pc / mileage_m | 163:5245 / 163:3766 | 2 / 3 |
| guide01~03_pc.webp | 163:5385 · 5398 · 5411 | 1 (테두리 포함 1028×548) |
| guide01~03_m.webp | 163:3905 · 3920 · 3932 | 3 (테두리 포함 310×561) |
| curation_pc / curation_m | 163:5425 / 163:3944 | 1 / 3 |

### export 후 삭제할 임시 노드

- `TMP_EXPORT_261023_GoodThingsToGift_gift02_pc` (168:2534)
- `TMP_EXPORT_261023_GoodThingsToGift_gift02_m` (168:2541)

키링 카드 안 이미지가 카드 밖으로 넘쳐 있어(PC -60px, MO -7px) 원본 프레임을 그대로 export하면 크기가 달라집니다. `clipsContent`만 켠 복제본입니다. 원본은 수정하지 않았습니다.

## 반영한 기획안 코멘트 (파란색 #dfe9ff만)

| 코멘트 | 구현 |
|---|---|
| 페이지 공통 스크롤 시 페이드인 | 참고 페이지 계열 `fadeEl` + `fadeCh fadeInUp`(`animation-delay`) — 레고트 규칙대로 한 번만 재생 |
| 이미지 3장 페이드인/아웃 롤링 (KV) | Swiper `effect: "fade"`, 3.5초 간격. 문구는 슬라이드 밖에 고정(3컷 모두 같은 문구) |
| 각 텍스트 클릭 시 해당 영역으로 슬라이드 앵커 / 스크롤 시 상단 고정 (탭) | `.p_tab` `position: sticky` + 헤더 높이만큼 `top` 갱신, 클릭 시 `animate` 스크롤, 스크롤 위치로 활성 탭 전환 |
| 각 썸네일 클릭 시 하단 상품 진열 앵커 | 혜택 1 썸네일 5개 → `#pj_cate01~05`(카테고리 상단 문구) |
| 유의사항 토글 (×2) | 버튼 `.on` 클래스 + `slideToggle`, 펼침 시 + → − (시안 `PC_Notice`/`Notice` 상태 프레임 문구) |
| 스텝 1/2/3 스와이퍼 모션 | Swiper loop + autoplay 3초 + 드래그, 페이지네이션(활성 막대형) 클릭 이동 |

- 노란색 "기획전 상품 진열 시스템 모듈 영역"(×5): 코딩하지 않음. 카테고리 상단 문구만 `<!-- 하위상품진열 상단 -->`으로 작성.
- 분홍색(탭 반투명 베리에이션, 아이폰 목업에 내용 얹기): 반영하지 않음. 시안에 있는 모양 그대로.

## 기획안 ↔ 시안 차이 (시안을 따름)

- 탭 이름·혜택 문구·카테고리 문구는 기획안과 시안이 같습니다.
- 기획안의 "아이폰 목업" 가이드는 시안에서 PC는 웹 화면 카드(1020×540), MO는 폰 화면(254×557)으로 바뀌어 있어 시안대로 했습니다.
- KV 슬라이드 순서는 메인 프레임 → 옆 프레임(가까운 쪽부터): 1 텀블러 2종 / 2 프레첼·런치박스 / 3 텀블러·쿠키.

## 확인 필요

1. **참고 페이지 원본 코드 대조 못 함**: 작업 환경에서 legodtofficial 사이트에 접속할 수 없어(WebFetch 권한 요청 시간 초과) `cate_no=291` 데이터 js(기획전관리자 앱)를 받지 못했습니다.
   같은 브랜드의 `cate_no=289`(skill 16장) 구조(`#promotion_box` > `p_keyvisual`·`p_secNN`, `fadeEl/fadeCh`, 주석량)를 따랐습니다. 291의 클래스·애니메이션 방식이 다르면 맞춰야 합니다.
2. **legodt 도메인 전역 CSS 대조 못 함**: 23-5에서 확인된 항목(전역 `.bg` 회피, `picture{display:flex}`·`button{font-family}`·`#container #contents` 덮기)은 반영했습니다. 그 외 새 충돌은 라이브에서 확인해 주세요.
3. **Swiper**: legodt 참고 페이지(15-1)처럼 본문 맨 위에 `/morenvy/js/swiper-bundle.min.js` 태그를 넣었습니다. Swiper CSS가 사이트에 없을 때를 대비해 기본 레이아웃 규칙 몇 줄을 `/* 공통 */`에 넣었습니다. 테스트 스킨에서는 레이아웃의 Swiper와 중복 로드됩니다.
4. **탭 고정 위치**: `#header`가 `.fixed`이거나 `position: fixed`일 때만 그 높이만큼 내려서 고정합니다. 조상 요소에 `overflow: hidden`이 있으면 sticky가 동작하지 않으니 라이브에서 확인해 주세요.
5. **레이아웃 경로**: 스킨 파일을 볼 수 없어 `/layout/basic/layout.html`로 두었습니다.
6. **이미지 경로**: 보드에 경로가 없고 skill에 legodt 전용 규칙이 없어 `/morenvyimg/promotion/261023_GoodThingsToGift/`로 두었습니다.
7. **`<picture><source srcset>` 경로 치환**: 카페24가 `srcset` 경로도 치환하는지 확인되지 않았습니다(skill 10장). MO에서 이미지가 깨지면 이것부터 확인해 주세요.
8. **카테고리 상단 문구 위치**: 상품 진열이 기획전 본문 뒤에 붙는 구조면 5개 문구가 연달아 보입니다. 기획전관리자 앱의 카테고리별 상단 HTML로 옮겨야 하는지 확인해 주세요.
9. **스텝 스와이퍼 자동 재생**: 코멘트에 속도·자동 여부가 없어 3초 자동 넘김 + 드래그로 했습니다.
10. **export 투명도**: `kv_title.webp`는 배경이 투명해야 합니다. 받은 뒤 흰 사각형이 보이면 알려주세요. 라운드 카드 이미지(cate·guide)는 모서리 투명 여부를 확인해 주세요(CSS에도 같은 라운드를 걸어 두었습니다).

## 라이브에서 확인할 것 (skill 11장)

- [ ] 콘솔에 `$ is not defined`·Swiper 오류가 없는가
- [ ] 1920·1440·1025·1024·768·360에서 KV 문구 위치, 탭 고정·활성 전환, 썸네일 앵커 위치(헤더 + 탭 높이만큼 위)
- [ ] KV 3장 페이드 롤링, 스텝 스와이퍼 페이지네이션
- [ ] 유의사항 2곳 펼침/접힘, 아이콘 + ↔ −
- [ ] 스크롤 끝까지 내려 모든 `.fadeEl`에 `.on`이 붙는가(한 번만 재생)
- [ ] 404 없음(이미지 31장 업로드 확인)
- [ ] 576~1024 구간 legodt `html` font-size 확대로 MO 요소가 넘치지 않는가
