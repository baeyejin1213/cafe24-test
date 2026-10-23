# promotions

기획전별 폴더가 여기에 생깁니다. 작성 규칙은 저장소 루트의 CLAUDE.md를 보세요.

## 이미지 받기

```
cd tools && npm install
FIGMA_TOKEN=figd_xxx node figma-export.mjs ../promotions/<폴더명>
```

Windows PowerShell: `$env:FIGMA_TOKEN="figd_xxx"; node figma-export.mjs ..\promotions\<폴더명>`
