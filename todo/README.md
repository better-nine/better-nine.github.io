# Daily Log

날짜별 마크다운으로 그날 한 일을 기록하면, 스크롤형 달력으로 출력되는 정적 사이트.
데이터베이스 없음. git이 단일 진실 공급원.

## 구조

```
days/            ← 하루 = 마크다운 파일 하나 (YYYY-MM-DD.md)
scripts/build.js ← days/*.md 를 docs/data.json 으로 합침 (의존성 없음)
docs/            ← GitHub Pages 가 서빙하는 정적 파일
  index.html     ← 스크롤 달력 + 체크리스트 + 상세 팝업
  vendor/        ← marked.min.js (자체 호스팅, CDN 의존 없음)
  data.json      ← 빌드 산출물 (커밋해도 되고, Actions가 매번 생성)
.github/workflows/deploy.yml ← push 시 빌드 + Pages 배포
```

## 매일 하는 일

1. `days/YYYY-MM-DD.md` 파일을 만들거나 연다.
2. 할 일을 아래 형식으로 적는다.
3. 완료하면 `[ ]` 를 `[x]` 로 바꾼다.
4. `git add . && git commit && git push` → 잠시 후 사이트에 반영.

## 마크다운 형식

```markdown
## [ ] 할 일 제목 (14:00)

이 아래부터 다음 ## 헤더 전까지가 상세 내용.
마크다운 그대로 쓸 수 있음 — 목록, **굵게**, `코드`, 코드블록 등.

## [x] 완료한 할 일

(시간은 선택. 제목 끝에 (HH:MM) 형태로 붙이면 됨)
```

- `## [ ]` → 미완료, `## [x]` → 완료
- 제목 끝의 `(HH:MM)` 는 시간으로 파싱됨 (없어도 됨)
- 화면에서는 `[ ] 할일` / `[o] 할일` 로 표시됨
- 할 일을 클릭하면 상세 내용 팝업이 뜸

## 로컬에서 미리 보기

```bash
node scripts/build.js        # data.json 생성
cd docs && python3 -m http.server 8000
# http://localhost:8000 접속
```

## 배포 (최초 1회)

1. GitHub 레포에 push.
2. Settings → Pages → Source 를 "GitHub Actions" 로 설정.
3. 이후 main 에 push 할 때마다 자동 빌드·배포.

## 나중에 확장할 것 (논의 예정)

- 카테고리 / 태그
- 카테고리별 시간 집계
