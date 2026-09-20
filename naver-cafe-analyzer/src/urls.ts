import type { CafeTarget } from "./types.ts";

const CAFE_HOSTS = new Set(["cafe.naver.com", "www.cafe.naver.com", "m.cafe.naver.com"]);

export function assertCafeUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error(`유효한 URL이 아닙니다: ${input}`);
  }

  if (!CAFE_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error(`네이버 카페 URL이 아닙니다: ${input}`);
  }

  return url;
}

export function toMobileCafeUrl(input: string): URL {
  const url = assertCafeUrl(input);
  const mobile = new URL(url.href);
  mobile.protocol = "https:";
  mobile.hostname = "m.cafe.naver.com";
  return mobile;
}

export function parseCafeTarget(input: string): CafeTarget {
  const url = toMobileCafeUrl(input);
  const articleFromQuery = url.searchParams.get("articleid") ?? url.searchParams.get("articleId");

  if (articleFromQuery) {
    return {
      kind: "article",
      href: url.href,
      clubName: clubNameFromPath(url.pathname),
      articleId: articleFromQuery,
    };
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const articleIdx = parts.findIndex((part) => part === "articles");

  if (articleIdx >= 0 && parts[articleIdx + 1] && /^\d+$/.test(parts[articleIdx + 1])) {
    return {
      kind: "article",
      href: url.href,
      clubName: parts[0] && parts[0] !== "articles" ? parts[0] : undefined,
      articleId: parts[articleIdx + 1],
    };
  }

  if (parts.length >= 2 && !isReservedPath(parts[0]) && /^\d+$/.test(parts[1])) {
    return {
      kind: "article",
      href: url.href,
      clubName: parts[0],
      articleId: parts[1],
    };
  }

  const clubName = clubNameFromPath(url.pathname);
  if (!clubName) {
    throw new Error(`카페 주소를 읽지 못했습니다: ${input}`);
  }

  return {
    kind: "list",
    href: url.href,
    clubName,
  };
}

function clubNameFromPath(pathname: string): string | undefined {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first || isReservedPath(first)) return undefined;
  return first;
}

function isReservedPath(part: string): boolean {
  return /^(ArticleRead|ArticleList|f-e|cafes|articles|search)$/i.test(part);
}
