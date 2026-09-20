# 네이버 카페 게시글 파싱 · 분석

이 폴더는 [Stagehand](https://github.com/browserbase/stagehand) **저장소가 아닙니다.**  
Stagehand는 브라우저에서 글을 뽑을 때만 쓰는 라이브러리입니다.

`Movtrength/-` 안의 독립 도구이며, 필름앱·온톨로지 페이지와도 분리되어 있습니다.

## 하는 일

1. 카페 URL을 모바일(`m.cafe.naver.com`)로 바꿉니다. 데스크톱 카페는 `iframe#cafe_main` 때문에 자동화하기 어렵습니다.
2. Stagehand `extract()`로 글 목록과 본문·댓글을 JSON으로 뽑습니다.
3. 주제, 질문, 눈에 띄는 글을 분석해 `report.md`를 만듭니다.

공개 글만 대상입니다. 로그인 우회, 캡차 우회, 멤버 전용 글 강제 접근은 하지 않습니다.

## 설치

```bash
cd naver-cafe-analyzer
npm install
cp .env.example .env
```

`.env`의 `MODEL_API_KEY`는 Stagehand가 페이지를 읽을 때 씁니다.  
Stagehand는 환경변수를 직접 읽지 않으므로, CLI가 키를 넘겨 줍니다.

## 명령

브라우저 없이 샘플만 보려면:

```bash
npm run demo
```

실제 카페(본인이 볼 수 있는 공개 글):

```bash
# 추출만
npx tsx src/cli.ts parse "https://cafe.naver.com/{카페주소}" --limit 5 --out out/latest

# 추출 + 분석
npx tsx src/cli.ts run "https://cafe.naver.com/{카페주소}/{글번호}" --out out/latest

# 이미 뽑은 JSON 분석
npx tsx src/cli.ts analyze out/latest/posts.json --out out/latest
```

로그인이 필요한 카페는 본인 계정으로 창을 연 뒤, 그 프로필을 재사용합니다.

```bash
npx tsx src/cli.ts parse "https://cafe.naver.com/{카페주소}" \
  --headed --user-data-dir ./browser-data --limit 5
```

첫 실행에서 네이버에 직접 로그인하면 `./browser-data`에 세션이 남습니다.  
다음부터는 같은 폴더를 쓰면 됩니다. 다른 사람 쿠키를 넣지 마세요.

## 흐름

```
카페 URL
  → parseCafeTarget (모바일 URL)
  → Stagehand extract (목록 / 본문 스키마)
  → posts.json
  → analyzePosts (기본) 또는 LLM
  → analysis.json + report.md
```

| 파일 | 역할 |
|------|------|
| `src/urls.ts` | 카페 URL 정규화 |
| `src/schemas.ts` | Stagehand extract용 Zod 스키마 |
| `src/scrape.ts` | Stagehand 호출 |
| `src/analyze.ts` | 주제·질문 분석 |
| `src/report.ts` | 마크다운 리포트 |
| `src/cli.ts` | 명령행 |

## 테스트

```bash
npm test
```

브라우저와 Stagehand 계정 없이 URL 파싱, 분석, 리포트, 스크레이프 순서를 검증합니다.

## 제한

- 네이버 카페 이용약관과 카페 운영 규칙을 지키세요.
- 요청 사이에 `--delay`를 둡니다. 기본 1.5초입니다.
- 멤버 전용·로그인 벽이면 `LoginRequiredError`로 멈춥니다.
- Stagehand 클라우드 브라우저를 쓰려면 `BROWSERBASE_API_KEY`를 넣고 `src/scrape.ts`의 local 런처를 바꾸면 됩니다. 기본은 로컬 브라우저입니다.
