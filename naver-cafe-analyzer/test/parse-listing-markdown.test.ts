import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMobileListingMarkdown } from "../src/parse-listing-markdown.ts";

const SAMPLE = `
[다시 시도](https://m.cafe.naver.com/tlswkd.cafe#)

- _NEW_
[만성신부전 3기인거 같은데, 고령자는 어느정도나 제한하나요?\\\\
\\\\
llollo  15:18  조회  21](https://m.cafe.naver.com/ArticleRead.nhn?clubid=10097006&articleid=605077&boardtype=L)

- _NEW_
[골밀도에 좋은 운동 아시나요?\\\\
\\\\
흠흠신  11:39  조회  97](https://m.cafe.naver.com/ArticleRead.nhn?clubid=10097006&articleid=605066&boardtype=L)

- _NEW_
[단백뇨 결과 상담\\\\
\\\\
꿈꾸는개미  10:57  조회  118](https://m.cafe.naver.com/ArticleRead.nhn?clubid=10097006&articleid=605064&boardtype=L)
`;

describe("parseMobileListingMarkdown", () => {
  it("제목, 작성자, 글번호를 읽는다", () => {
    const articles = parseMobileListingMarkdown(SAMPLE);
    assert.equal(articles.length, 3);
    assert.equal(articles[0].articleId, "605077");
    assert.equal(articles[0].title, "만성신부전 3기인거 같은데, 고령자는 어느정도나 제한하나요?");
    assert.equal(articles[1].articleId, "605066");
    assert.equal(articles[1].title, "골밀도에 좋은 운동 아시나요?");
    assert.equal(articles[2].articleId, "605064");
  });
});
