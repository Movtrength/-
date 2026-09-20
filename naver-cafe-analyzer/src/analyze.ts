import type { CafeAnalysis, CafePost, ThemeBucket } from "./types.ts";

const STOPWORDS = new Set([
  "그리고",
  "그러나",
  "그래서",
  "그런",
  "이것",
  "저것",
  "그것",
  "있는",
  "없는",
  "하는",
  "하기",
  "해서",
  "입니다",
  "습니다",
  "어요",
  "네요",
  "오늘",
  "그냥",
  "정말",
  "너무",
  "조금",
  "많이",
  "제가",
  "저는",
  "우리",
  "이번",
  "다음",
  "관련",
  "정도",
  "때문에",
  "같아요",
  "입니다",
  "있어요",
  "없어요",
]);

const QUESTION_MARKERS = ["?", "？", "궁금", "어떻게", "방법", "하나요", "인가요", "일까요", "뭐예요", "뭐에요"];

export function analyzePosts(posts: CafePost[]): CafeAnalysis {
  const visible = posts.filter((post) => !post.requiresLogin && post.body.trim());
  const commentCount = visible.reduce((sum, post) => sum + post.comments.length, 0);
  const themes = rankThemes(visible);
  const questions = collectQuestions(visible);
  const notablePosts = visible
    .slice()
    .sort((a, b) => scorePost(b) - scorePost(a))
    .slice(0, 3)
    .map((post) => `${post.title} — ${clip(post.body, 80)}`);

  const themeNames = themes.slice(0, 3).map((theme) => theme.name);
  const overview = visible.length
    ? `${visible.length}개 글을 읽었습니다. 댓글 ${commentCount}개. ${
        themeNames.length ? `자주 나온 주제: ${themeNames.join(", ")}.` : "뚜렷한 반복 주제는 적습니다."
      }`
    : "분석할 공개 본문이 없습니다. 로그인 벽이거나 본문이 비어 있습니다.";

  return {
    overview,
    postCount: visible.length,
    commentCount,
    themes,
    questions,
    notablePosts,
    suggestedFollowups: suggestFollowups(questions, themes),
  };
}

export async function analyzePostsWithLlm(
  posts: CafePost[],
  options: {
    apiKey: string;
    model?: string;
    fetchImpl?: typeof fetch;
  },
): Promise<CafeAnalysis> {
  const fallback = analyzePosts(posts);
  const fetchImpl = options.fetchImpl ?? fetch;
  const model = options.model ?? "gpt-4.1-mini";
  const response = await fetchImpl("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "네이버 카페 글을 분석하는 도우미입니다. JSON만 반환하세요. keys: overview, themes[{name,count,examples}], questions, notablePosts, suggestedFollowups.",
        },
        {
          role: "user",
          content: JSON.stringify(
            posts.map((post) => ({
              title: post.title,
              author: post.author,
              body: clip(post.body, 1200),
              comments: post.comments.map((comment) => comment.body).slice(0, 8),
            })),
          ),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM 분석 실패: ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return fallback;

  const parsed = JSON.parse(content) as Partial<CafeAnalysis>;
  return {
    overview: parsed.overview ?? fallback.overview,
    postCount: fallback.postCount,
    commentCount: fallback.commentCount,
    themes: Array.isArray(parsed.themes) && parsed.themes.length ? parsed.themes : fallback.themes,
    questions: parsed.questions ?? fallback.questions,
    notablePosts: parsed.notablePosts ?? fallback.notablePosts,
    suggestedFollowups: parsed.suggestedFollowups ?? fallback.suggestedFollowups,
  };
}

function rankThemes(posts: CafePost[]): ThemeBucket[] {
  const counts = new Map<string, { count: number; examples: string[] }>();

  for (const post of posts) {
    const tokens = tokenize(`${post.title} ${post.body}`);
    const unique = new Set(tokens);
    for (const token of unique) {
      const entry = counts.get(token) ?? { count: 0, examples: [] };
      entry.count += 1;
      if (entry.examples.length < 3 && !entry.examples.includes(post.title)) {
        entry.examples.push(post.title);
      }
      counts.set(token, entry);
    }
  }

  return [...counts.entries()]
    .filter(([, value]) => value.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([name, value]) => ({ name, count: value.count, examples: value.examples }));
}

function collectQuestions(posts: CafePost[]): string[] {
  const found: string[] = [];
  for (const post of posts) {
    const lines = `${post.title}\n${post.body}`.split(/\n+/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && QUESTION_MARKERS.some((marker) => trimmed.includes(marker))) {
        found.push(clip(trimmed, 120));
      }
    }
  }
  return [...new Set(found)].slice(0, 12);
}

function suggestFollowups(questions: string[], themes: ThemeBucket[]): string[] {
  const items: string[] = [];
  if (questions.length) {
    items.push("질문 글을 묶어 FAQ 초안을 만든다.");
  }
  if (themes[0]) {
    items.push(`가장 반복된 주제(${themes[0].name})로 후속 글을 정리한다.`);
  }
  if (!items.length) {
    items.push("더 많은 공개 글을 모은 뒤 다시 분석한다.");
  }
  return items;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => normalizeKoreanToken(token.trim()))
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

function normalizeKoreanToken(token: string): string {
  return token
    .replace(/(에서|으로|로서|처럼|보다|까지|부터)$/u, "")
    .replace(/[이가을를은는의에와과도]$/u, "");
}

function scorePost(post: CafePost): number {
  return post.body.length + post.comments.length * 40 + (post.title.includes("?") ? 20 : 0);
}

function clip(text: string, max: number): string {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length > max ? `${compact.slice(0, max - 1)}…` : compact;
}
