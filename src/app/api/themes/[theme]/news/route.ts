import { NextRequest, NextResponse } from "next/server";
import { mockArticles, themeSummaries } from "@/data/mockNews";
import { Category, Theme, ThemeNewsResponse } from "@/types/news";

const validThemes: Theme[] = ["반도체", "AI", "방산"];
const validCategories: Category[] = ["전체", "경제", "사회", "정치"];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ theme: string }> }
) {
  const { theme } = await context.params;
  const decodedTheme = decodeURIComponent(theme) as Theme;

  if (!validThemes.includes(decodedTheme)) {
    return NextResponse.json(
      { message: "유효하지 않은 테마입니다." },
      { status: 400 }
    );
  }

  const categoryParam =
    request.nextUrl.searchParams.get("category") ?? "전체";
  const category = categoryParam as Category;

  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { message: "유효하지 않은 카테고리입니다." },
      { status: 400 }
    );
  }

  const filteredArticles = mockArticles.filter((article) => {
    const matchesTheme = article.theme === decodedTheme;
    const matchesCategory =
      category === "전체" || article.category === category;

    return matchesTheme && matchesCategory;
  });

  const response: ThemeNewsResponse = {
    theme: decodedTheme,
    category,
    summary: themeSummaries[decodedTheme],
    articles: filteredArticles,
  };

  return NextResponse.json(response);
}