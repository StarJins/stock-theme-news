import { Category, Theme, ThemeNewsResponse } from "@/types/news";

export async function getThemeNews(
  theme: Theme,
  category: Category
): Promise<ThemeNewsResponse> {
  const url = `/api/themes/${encodeURIComponent(
    theme
  )}/news?category=${encodeURIComponent(category)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("뉴스 데이터를 불러오지 못했습니다.");
  }

  const data: ThemeNewsResponse = await response.json();
  return data;
}