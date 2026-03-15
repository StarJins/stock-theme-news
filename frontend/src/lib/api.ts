import { Category, Theme, ThemeNewsResponse } from "@/types/news";

export async function getThemeNews(
  theme: Theme,
  category: Category,
  page: number = 1,
  pageSize: number = 10
): Promise<ThemeNewsResponse> {
  const url = `/api/themes/${encodeURIComponent(
    theme
  )}/news?category=${encodeURIComponent(category)}&page=${page}&page_size=${pageSize}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("뉴스 데이터를 불러오지 못했습니다.");
  }

  return response.json();
}