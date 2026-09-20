import type { CafeAnalysis, CafePost } from "./types.ts";

export function renderMarkdownReport(posts: CafePost[], analysis: CafeAnalysis): string {
  const lines = [
    "# 네이버 카페 게시글 분석",
    "",
    analysis.overview,
    "",
    `- 글 ${analysis.postCount}개 · 댓글 ${analysis.commentCount}개`,
    "",
    "## 주제",
    "",
  ];

  if (!analysis.themes.length) {
    lines.push("반복 주제가 충분하지 않습니다.", "");
  } else {
    for (const theme of analysis.themes) {
      lines.push(`- **${theme.name}** (${theme.count}) — ${theme.examples.join(" / ")}`);
    }
    lines.push("");
  }

  lines.push("## 질문", "");
  if (!analysis.questions.length) {
    lines.push("질문 문장을 찾지 못했습니다.", "");
  } else {
    for (const question of analysis.questions) {
      lines.push(`- ${question}`);
    }
    lines.push("");
  }

  lines.push("## 눈에 띄는 글", "");
  if (!analysis.notablePosts.length) {
    lines.push("없습니다.", "");
  } else {
    for (const item of analysis.notablePosts) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  lines.push("## 다음 작업", "");
  for (const item of analysis.suggestedFollowups) {
    lines.push(`- ${item}`);
  }
  lines.push("", "## 원문", "");

  for (const post of posts) {
    lines.push(`### ${post.title || "(제목 없음)"}`);
    lines.push("");
    lines.push(`- 작성자: ${post.author || "-"}`);
    lines.push(`- 날짜: ${post.date || "-"}`);
    lines.push(`- URL: ${post.url}`);
    if (post.requiresLogin) {
      lines.push("- 상태: 로그인 필요");
    }
    lines.push("", post.body || "(본문 없음)", "");
    if (post.comments.length) {
      lines.push("댓글:");
      for (const comment of post.comments) {
        lines.push(`- ${comment.author}: ${comment.body}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}
