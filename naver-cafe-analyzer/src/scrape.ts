import { localBrowser, Stagehand } from "@browserbasehq/stagehand";
import { CafeListingSchema, CafePostSchema } from "./schemas.ts";
import type { CafeListing, CafePost } from "./types.ts";
import { parseCafeTarget } from "./urls.ts";

export class LoginRequiredError extends Error {
  constructor(url: string) {
    super(`이 페이지는 로그인 또는 멤버 권한이 필요합니다: ${url}`);
    this.name = "LoginRequiredError";
  }
}

export type ScrapeOptions = {
  url: string;
  limit?: number;
  delayMs?: number;
  headless?: boolean;
  userDataDir?: string;
  modelApiKey: string;
  modelName?: string;
};

export type ScrapeResult = {
  listing?: CafeListing;
  posts: CafePost[];
};

type StagehandSession = {
  extract: typeof Stagehand.prototype.extract;
  close: () => Promise<void>;
};

type BrowserSession = {
  context: { pages: () => Promise<Array<{ goto: (url: string) => Promise<unknown> }>> };
  close: () => Promise<void>;
};

export type ScrapeDeps = {
  launchBrowser?: (options: ScrapeOptions) => Promise<BrowserSession>;
  createStagehand?: (browser: BrowserSession, options: ScrapeOptions) => Promise<StagehandSession>;
  sleep?: (ms: number) => Promise<void>;
};

export async function scrapeCafe(
  options: ScrapeOptions,
  deps: ScrapeDeps = {},
): Promise<ScrapeResult> {
  const target = parseCafeTarget(options.url);
  const limit = options.limit ?? 8;
  const delayMs = options.delayMs ?? 1500;
  const sleep = deps.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));

  const browser = await (deps.launchBrowser ?? launchLocalBrowser)(options);
  const stagehand = await (deps.createStagehand ?? createLocalStagehand)(browser, options);

  try {
    const [page] = await browser.context.pages();

    if (target.kind === "article") {
      await page.goto(target.href);
      const post = await extractPost(stagehand, target.href);
      return { posts: [post] };
    }

    await page.goto(target.href);
    const listing = await extractListing(stagehand);
    if (listing.requiresLogin && listing.articles.length === 0) {
      throw new LoginRequiredError(target.href);
    }

    const posts: CafePost[] = [];
    for (const article of listing.articles.slice(0, limit)) {
      const href = article.url || target.href;
      await page.goto(href);
      const post = await extractPost(stagehand, href);
      posts.push(post);
      if (posts.length < Math.min(limit, listing.articles.length)) {
        await sleep(delayMs);
      }
    }

    return { listing, posts };
  } finally {
    await stagehand.close();
    await browser.close();
  }
}

async function extractListing(stagehand: StagehandSession): Promise<CafeListing> {
  const { data } = await stagehand.extract(
    "모바일 네이버 카페 글 목록에서 카페 이름과 지금 화면에 보이는 게시글을 모두 추출하세요. 로그인/멤버 전용 안내가 있으면 requiresLogin을 true로 하세요. 광고와 메뉴는 제외하세요.",
    CafeListingSchema,
  );
  return data;
}

async function extractPost(stagehand: StagehandSession, fallbackUrl: string): Promise<CafePost> {
  const { data } = await stagehand.extract(
    "지금 열린 네이버 카페 게시글의 제목, 작성자, 날짜, 게시판, 본문, 이미지 URL, 댓글을 추출하세요. 로그인 벽이면 requiresLogin true, 본문은 빈 문자열로 두세요.",
    CafePostSchema,
  );
  if (data.requiresLogin && !data.body.trim()) {
    throw new LoginRequiredError(data.url || fallbackUrl);
  }
  return { ...data, url: data.url || fallbackUrl };
}

async function launchLocalBrowser(options: ScrapeOptions): Promise<BrowserSession> {
  return localBrowser.launch({
    headless: options.headless ?? true,
    userDataDir: options.userDataDir,
    preserveUserDataDir: Boolean(options.userDataDir),
    locale: "ko-KR",
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    chromiumSandbox: false,
  }) as unknown as BrowserSession;
}

async function createLocalStagehand(
  browser: BrowserSession,
  options: ScrapeOptions,
): Promise<StagehandSession> {
  return Stagehand.create({
    browser: browser as never,
    model: {
      modelName: options.modelName ?? "openai/gpt-4.1-mini",
      apiKey: options.modelApiKey,
    },
  });
}
