import { Category, Theme, ThemeNewsResponse } from "@/types/news";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.");
}

export async function getThemeNews(
  theme: Theme,
  category: Category
): Promise<ThemeNewsResponse> {
  const url = `${API_BASE_URL}/themes/${encodeURIComponent(
    theme
  )}/news?category=${encodeURIComponent(category)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("백엔드에서 뉴스 데이터를 불러오지 못했습니다.");
  }

  const data: ThemeNewsResponse = await response.json();
  return data;
}