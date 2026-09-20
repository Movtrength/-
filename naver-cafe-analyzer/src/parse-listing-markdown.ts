import type { CafeArticleSummary, CafePost } from "./types.ts";

const ARTICLE_LINK = /\]\((https:\/\/m\.cafe\.naver\.com\/ArticleRead\.nhn\?[^)]+)\)/g;

export function parseMobileListingMarkdown(markdown: string): CafeArticleSummary[] {
  const articles: CafeArticleSummary[] = [];

  for (const match of markdown.matchAll(ARTICLE_LINK)) {
    const url = match[1];
    const articleId = new URL(url).searchParams.get("articleid") ?? "";
    const open = markdown.lastIndexOf("[", match.index);
    if (open < 0 || !articleId) continue;

    const inner = markdown.slice(open + 1, match.index);
    const lines = inner
      .replace(/\\/g, "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) continue;

    const title = lines[0];
    const meta = lines[lines.length - 1];
    const parsed = meta.match(/^(.*?)\s+(\d{1,2}:\d{2}|[\d.]+)\s+조회\s+([\d,]+)$/);
    if (!parsed || !isCleanTitle(title)) continue;

    articles.push({
      articleId,
      title,
      author: parsed[1].trim(),
      date: parsed[2],
      viewCount: parsed[3],
      commentCount: "",
      url,
    });
  }

  return dedupe(articles);
}

export function summariesToPosts(articles: CafeArticleSummary[]): CafePost[] {
  return articles.map((article) => ({
    articleId: article.articleId,
    title: article.title,
    author: article.author,
    date: article.date,
    board: "",
    viewCount: article.viewCount,
    likeCount: "",
    body: article.title,
    url: article.url,
    requiresLogin: false,
    images: [],
    comments: [],
  }));
}

function isCleanTitle(title: string): boolean {
  return !title.includes("](") && !/^https?:\/\//.test(title);
}

function dedupe(articles: CafeArticleSummary[]): CafeArticleSummary[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (seen.has(article.articleId)) return false;
    seen.add(article.articleId);
    return true;
  });
}
