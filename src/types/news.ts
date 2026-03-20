export type Theme = "반도체" | "AI" | "방산";

export type Category = "전체" | "경제" | "사회" | "정치";

export type NewsCategory = "경제" | "사회" | "정치";

export type NewsItem = {
  id: number;
  theme: Theme;
  title: string;
  source: string;
  publishedAt: string;
  category: NewsCategory;
  summary: string;
  url: string;
  relevanceScore?: number | null;
};

export type ThemeNewsResponse = {
  theme: Theme;
  category: Category;
  summary: string;
  articles: NewsItem[];
  page: number;
  page_size: number;
  has_more: boolean;
  total_articles: number;
  generated_at?: string | null;
  expires_at?: string | null;
  cache_hit?: boolean;
};
