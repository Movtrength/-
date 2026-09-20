import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCafeTarget, toMobileCafeUrl } from "../src/urls.ts";

describe("toMobileCafeUrl", () => {
  it("데스크톱 카페 홈을 모바일로 바꾼다", () => {
    const url = toMobileCafeUrl("https://cafe.naver.com/joonggonara");
    assert.equal(url.hostname, "m.cafe.naver.com");
    assert.equal(url.pathname, "/joonggonara");
  });

  it("이미 모바일이면 호스트를 유지한다", () => {
    const url = toMobileCafeUrl("https://m.cafe.naver.com/joonggonara/12");
    assert.equal(url.href, "https://m.cafe.naver.com/joonggonara/12");
  });

  it("카페가 아니면 거절한다", () => {
    assert.throws(() => toMobileCafeUrl("https://blog.naver.com/foo"), /네이버 카페 URL이 아닙니다/);
  });
});

describe("parseCafeTarget", () => {
  it("카페 홈은 list다", () => {
    const target = parseCafeTarget("https://cafe.naver.com/movtrength");
    assert.deepEqual(target, {
      kind: "list",
      href: "https://m.cafe.naver.com/movtrength",
      clubName: "movtrength",
    });
  });

  it("카페/글번호는 article이다", () => {
    const target = parseCafeTarget("https://cafe.naver.com/movtrength/2048");
    assert.equal(target.kind, "article");
    if (target.kind === "article") {
      assert.equal(target.clubName, "movtrength");
      assert.equal(target.articleId, "2048");
    }
  });

  it("articleid 쿼리를 article로 읽는다", () => {
    const target = parseCafeTarget(
      "https://cafe.naver.com/ArticleRead.nhn?clubid=10050146&articleid=88",
    );
    assert.equal(target.kind, "article");
    if (target.kind === "article") {
      assert.equal(target.articleId, "88");
    }
  });
});
