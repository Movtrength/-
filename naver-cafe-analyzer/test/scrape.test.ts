import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LoginRequiredError, scrapeCafe } from "../src/scrape.ts";
import type { CafeListing, CafePost } from "../src/types.ts";

function fakeBrowser(visits: string[]) {
  const page = {
    goto: async (url: string) => {
      visits.push(url);
    },
  };
  return {
    context: {
      pages: async () => [page],
    },
    close: async () => {},
  };
}

describe("scrapeCafe", () => {
  it("글 목록을 읽은 뒤 제한 수만큼 본문을 연다", async () => {
    const visits: string[] = [];
    const listing: CafeListing = {
      cafeTitle: "테스트",
      clubName: "movtrength",
      requiresLogin: false,
      articles: [
        {
          articleId: "1",
          title: "하나",
          author: "a",
          date: "",
          viewCount: "",
          commentCount: "",
          url: "https://m.cafe.naver.com/movtrength/1",
        },
        {
          articleId: "2",
          title: "둘",
          author: "b",
          date: "",
          viewCount: "",
          commentCount: "",
          url: "https://m.cafe.naver.com/movtrength/2",
        },
      ],
    };
    const post: CafePost = {
      articleId: "1",
      title: "하나",
      author: "a",
      date: "",
      board: "",
      viewCount: "",
      likeCount: "",
      body: "본문",
      url: "https://m.cafe.naver.com/movtrength/1",
      requiresLogin: false,
      images: [],
      comments: [],
    };

    let extractCalls = 0;
    const result = await scrapeCafe(
      { url: "https://cafe.naver.com/movtrength", limit: 1, delayMs: 0, modelApiKey: "x" },
      {
        launchBrowser: async () => fakeBrowser(visits),
        createStagehand: async () => ({
          extract: async () => {
            extractCalls += 1;
            if (extractCalls === 1) return { data: listing };
            return { data: { ...post, url: visits.at(-1) ?? post.url } };
          },
          close: async () => {},
        }),
        sleep: async () => {},
      },
    );

    assert.equal(result.posts.length, 1);
    assert.deepEqual(visits, [
      "https://m.cafe.naver.com/movtrength",
      "https://m.cafe.naver.com/movtrength/1",
    ]);
  });

  it("로그인 벽이면 멈춘다", async () => {
    await assert.rejects(
      () =>
        scrapeCafe(
          { url: "https://cafe.naver.com/secretcafe", modelApiKey: "x" },
          {
            launchBrowser: async () => fakeBrowser([]),
            createStagehand: async () => ({
              extract: async () => ({
                data: {
                  cafeTitle: "비밀",
                  clubName: "secretcafe",
                  requiresLogin: true,
                  articles: [],
                },
              }),
              close: async () => {},
            }),
          },
        ),
      LoginRequiredError,
    );
  });
});
