export type Theme = "반도체" | "AI" | "방산" | "원전" | "배터리" | "건설" | "부동산" | "우주항공" | "전쟁";
export type Category = string;
export type NewsCategory = string;

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
  relevancePercent?: number | null;
  relevanceLabel?: string | null;
  publisher?: string | null;
  matchedQuery?: string | null;
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