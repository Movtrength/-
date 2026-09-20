import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzePosts } from "../src/analyze.ts";
import { renderMarkdownReport } from "../src/report.ts";
import type { CafePost } from "../src/types.ts";

const post: CafePost = {
  articleId: "9",
  title: "폼롤러 방법이 궁금합니다",
  author: "회원",
  date: "2026.09.20",
  board: "질문",
  viewCount: "10",
  likeCount: "1",
  body: "종아리 폼롤러 방법이 궁금합니다.",
  url: "https://m.cafe.naver.com/demo/9",
  requiresLogin: false,
  images: [],
  comments: [{ author: "코치", date: "2026.09.20", body: "천천히 미세요." }],
};

describe("renderMarkdownReport", () => {
  it("개요와 원문을 넣는다", () => {
    const analysis = analyzePosts([post]);
    const markdown = renderMarkdownReport([post], analysis);
    assert.match(markdown, /네이버 카페 게시글 분석/);
    assert.match(markdown, /폼롤러 방법이 궁금합니다/);
    assert.match(markdown, /천천히 미세요/);
    assert.match(markdown, /다음 작업/);
  });
});
