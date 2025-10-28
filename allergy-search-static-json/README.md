# 정적 JSON 기반 알레르기 검색 (Vite + TypeScript)

서버 없이 GitHub Pages로 배포하며 `/public/data/allergens.json`을 읽어 검색합니다.

## 빠른 시작
```bash
npm ci
npm run dev        # http://localhost:5173
npm run build
npm run preview    # 로컬에서 빌드 결과 확인
```

## 데이터 갱신
- `public/data/allergens.json`만 수정/커밋하면 배포에 즉시 반영됩니다.
- 대량 데이터/자동 갱신이 필요하면 GitHub Actions(크론)으로 원천에서 JSON 생성 후 커밋하는 방식을 권장합니다.

## 접근성 & 성능
- 초성 매칭 지원(간단 버전), 제안(Pill) 제공
- Lighthouse 90+ 목표(기본 스타일/ARIA 적용)

## GitHub Pages 배포 (better-nine.github.io)
- 본 레포가 **사용자 페이지** 저장소(`better-nine.github.io`)라면 기본 설정으로 동작합니다.
- 워크플로우: `.github/workflows/pages.yml`
