import { z } from "zod";

export const CafeArticleSummarySchema = z.object({
  articleId: z.string().describe("숫자 게시글 ID"),
  title: z.string().describe("게시글 제목"),
  author: z.string().describe("작성자 닉네임"),
  date: z.string().describe("작성일 또는 상대 시간"),
  viewCount: z.string().describe("조회수 텍스트. 없으면 빈 문자열"),
  commentCount: z.string().describe("댓글 수 텍스트. 없으면 빈 문자열"),
  url: z.string().describe("게시글 절대 URL"),
});

export const CafeListingSchema = z.object({
  cafeTitle: z.string().describe("카페 이름"),
  clubName: z.string().describe("카페 주소 슬러그"),
  requiresLogin: z
    .boolean()
    .describe("로그인/멤버 전용 안내가 보이면 true"),
  articles: z.array(CafeArticleSummarySchema).describe("현재 화면에 보이는 게시글"),
});

export const CafeCommentSchema = z.object({
  author: z.string(),
  date: z.string(),
  body: z.string(),
});

export const CafePostSchema = z.object({
  articleId: z.string(),
  title: z.string(),
  author: z.string(),
  date: z.string(),
  board: z.string().describe("게시판 이름. 없으면 빈 문자열"),
  viewCount: z.string(),
  likeCount: z.string(),
  body: z.string().describe("본문 전체 텍스트"),
  url: z.string(),
  requiresLogin: z.boolean(),
  images: z.array(z.string()).describe("본문 이미지 URL"),
  comments: z.array(CafeCommentSchema),
});

export type CafeListingData = z.infer<typeof CafeListingSchema>;
export type CafePostData = z.infer<typeof CafePostSchema>;
