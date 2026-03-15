import { Category, Theme, ThemeNewsResponse } from "@/types/news";

export async function getThemeNews(
  theme: Theme,
  category: Category,
  page: number = 1,
  pageSize: number = 10
): Promise<ThemeNewsResponse> {
  const searchParams = new URLSearchParams({
    category,
    page: String(page),
    page_size: String(pageSize),
  });

  const response = await fetch(
    `/api/themes/${encodeURIComponent(theme)}/news?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ?? "뉴스 데이터를 불러오는 중 오류가 발생했습니다.";
    throw new Error(message);
  }

  return data;
}
