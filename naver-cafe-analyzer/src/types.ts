export type CafeTarget =
  | {
      kind: "list";
      href: string;
      clubName: string;
    }
  | {
      kind: "article";
      href: string;
      clubName?: string;
      articleId: string;
    };

export type CafeArticleSummary = {
  articleId: string;
  title: string;
  author: string;
  date: string;
  viewCount: string;
  commentCount: string;
  url: string;
};

export type CafeComment = {
  author: string;
  date: string;
  body: string;
};

export type CafePost = {
  articleId: string;
  title: string;
  author: string;
  date: string;
  board: string;
  viewCount: string;
  likeCount: string;
  body: string;
  url: string;
  requiresLogin: boolean;
  images: string[];
  comments: CafeComment[];
};

export type CafeListing = {
  cafeTitle: string;
  clubName: string;
  requiresLogin: boolean;
  articles: CafeArticleSummary[];
};

export type ThemeBucket = {
  name: string;
  count: number;
  examples: string[];
};

export type CafeAnalysis = {
  overview: string;
  postCount: number;
  commentCount: number;
  themes: ThemeBucket[];
  questions: string[];
  notablePosts: string[];
  suggestedFollowups: string[];
};

export type AnalyzeMode = "heuristic" | "llm";
