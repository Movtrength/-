import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { analyzePosts, analyzePostsWithLlm } from "../src/analyze.ts";
import type { CafePost } from "../src/types.ts";

async function samplePosts(): Promise<CafePost[]> {
  return JSON.parse(
    await readFile(new URL("../fixtures/sample-posts.json", import.meta.url), "utf8"),
  ) as CafePost[];
}

describe("analyzePosts", () => {
  it("로그인 글은 빼고 주제를 센다", async () => {
    const analysis = analyzePosts(await samplePosts());
    assert.equal(analysis.postCount, 2);
    assert.equal(analysis.commentCount, 1);
    assert.ok(analysis.themes.some((theme) => theme.name === "스쿼트"));
    assert.ok(analysis.themes.some((theme) => theme.name === "무릎" || theme.name === "통증"));
    assert.ok(analysis.questions.some((question) => question.includes("어떻게")));
    assert.match(analysis.overview, /2개 글/);
  });

  it("공개 본문이 없으면 빈 분석이다", () => {
    const analysis = analyzePosts([
      {
        articleId: "1",
        title: "비밀",
        author: "x",
        date: "",
        board: "",
        viewCount: "",
        likeCount: "",
        body: "",
        url: "https://m.cafe.naver.com/x/1",
        requiresLogin: true,
        images: [],
        comments: [],
      },
    ]);
    assert.equal(analysis.postCount, 0);
    assert.match(analysis.overview, /분석할 공개 본문이 없습니다/);
  });
});

describe("analyzePostsWithLlm", () => {
  it("모델 JSON을 분석 결과에 합친다", async () => {
    const posts = await samplePosts();
    const analysis = await analyzePostsWithLlm(posts, {
      apiKey: "test-key",
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    overview: "LLM 요약",
                    themes: [{ name: "무릎", count: 2, examples: ["스쿼트"] }],
                    questions: ["깊이 조절?"],
                    notablePosts: ["주목 글"],
                    suggestedFollowups: ["FAQ"],
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    });

    assert.equal(analysis.overview, "LLM 요약");
    assert.equal(analysis.postCount, 2);
    assert.deepEqual(analysis.questions, ["깊이 조절?"]);
  });
});
