import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { analyzePosts, analyzePostsWithLlm } from "./analyze.ts";
import { renderMarkdownReport } from "./report.ts";
import { scrapeCafe } from "./scrape.ts";
import type { CafePost } from "./types.ts";

type Command = "parse" | "analyze" | "run" | "demo" | "help";

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const resolved = (command ?? "help") as Command;

  if (resolved === "help" || resolved === "--help" || resolved === "-h") {
    printHelp();
    return;
  }

  if (resolved === "demo") {
    await writeOutputs(await loadFixturePosts(), "out/demo");
    return;
  }

  if (resolved === "analyze") {
    const input = rest[0];
    if (!input) throw new Error("analyze에는 posts.json 경로가 필요합니다.");
    const posts = JSON.parse(await readFile(input, "utf8")) as CafePost[];
    await writeOutputs(posts, flagValue(rest, "--out") ?? "out/analysis");
    return;
  }

  if (resolved === "parse" || resolved === "run") {
    const url = rest.find((arg) => !arg.startsWith("--"));
    if (!url) throw new Error("네이버 카페 URL이 필요합니다.");
    const modelApiKey = process.env.MODEL_API_KEY ?? process.env.OPENAI_API_KEY;
    if (!modelApiKey) {
      throw new Error("MODEL_API_KEY 또는 OPENAI_API_KEY가 필요합니다.");
    }

    const result = await scrapeCafe({
      url,
      limit: numberFlag(rest, "--limit", 8),
      delayMs: numberFlag(rest, "--delay", 1500),
      headless: !rest.includes("--headed"),
      userDataDir: flagValue(rest, "--user-data-dir") ?? process.env.USER_DATA_DIR,
      modelApiKey,
      modelName: process.env.MODEL_NAME,
    });

    const outDir = flagValue(rest, "--out") ?? "out/latest";
    await mkdir(outDir, { recursive: true });
    await writeFile(resolve(outDir, "listing.json"), JSON.stringify(result.listing ?? null, null, 2));
    await writeFile(resolve(outDir, "posts.json"), JSON.stringify(result.posts, null, 2));

    if (resolved === "run") {
      await writeOutputs(result.posts, outDir);
    } else {
      console.log(`저장: ${resolve(outDir, "posts.json")} (${result.posts.length}개)`);
    }
    return;
  }

  throw new Error(`알 수 없는 명령: ${command}`);
}

async function writeOutputs(posts: CafePost[], outDir: string) {
  const analysis =
    process.env.MODEL_API_KEY || process.env.OPENAI_API_KEY
      ? await analyzePostsWithLlm(posts, {
          apiKey: process.env.MODEL_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
          model: process.env.ANALYZE_MODEL,
        }).catch((error: unknown) => {
          console.warn(error instanceof Error ? error.message : error);
          return analyzePosts(posts);
        })
      : analyzePosts(posts);

  const dir = resolve(outDir);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "posts.json"), JSON.stringify(posts, null, 2));
  await writeFile(resolve(dir, "analysis.json"), JSON.stringify(analysis, null, 2));
  const markdown = renderMarkdownReport(posts, analysis);
  await writeFile(resolve(dir, "report.md"), markdown);
  console.log(markdown);
  console.log(`\n저장: ${dirname(resolve(dir, "report.md"))}`);
}

async function loadFixturePosts(): Promise<CafePost[]> {
  const fixtureUrl = new URL("../fixtures/sample-posts.json", import.meta.url);
  return JSON.parse(await readFile(fixtureUrl, "utf8")) as CafePost[];
}

function flagValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function numberFlag(args: string[], name: string, fallback: number): number {
  const value = flagValue(args, name);
  return value ? Number(value) : fallback;
}

function printHelp() {
  console.log(`naver-cafe-analyzer — Stagehand를 쓰는 별도 프로젝트

명령:
  demo                         샘플 글만 분석 (브라우저 없음)
  parse <cafe-url>             글 목록/본문 추출
  analyze <posts.json>         이미 뽑은 글 분석
  run <cafe-url>               추출 + 분석

옵션:
  --limit 8                    읽을 글 수
  --delay 1500                 글 사이 대기(ms)
  --out out/latest             저장 폴더
  --headed                     브라우저 창 표시 (직접 로그인할 때)
  --user-data-dir ./browser-data

환경변수:
  MODEL_API_KEY                Stagehand extract용 모델 키
  MODEL_NAME                   예: openai/gpt-4.1-mini
  USER_DATA_DIR                로그인 세션 유지 폴더

공개 글만 대상입니다. 로그인 우회나 캡차는 다루지 않습니다.
`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
