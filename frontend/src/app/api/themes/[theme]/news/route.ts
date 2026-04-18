import { NextRequest, NextResponse } from "next/server";
import { getThemeNewsPage } from "@/server/news/service";
import { Category, Theme } from "@/types/news";
import { THEME_CATEGORIES } from "@/server/news/shared";

const THEMES: Theme[] = [
  "반도체",
  "AI",
  "방산",
  "원전",
  "배터리",
  "건설",
  "부동산",
  "우주항공",
  "전쟁",
];

function isTheme(value: string): value is Theme {
  return THEMES.includes(value as Theme);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ theme: string }> }
) {
  try {
    const { theme: rawTheme } = await context.params;

    if (!isTheme(rawTheme)) {
      return NextResponse.json(
        { message: "지원하지 않는 테마입니다." },
        { status: 400 }
      );
    }

    const categoryParam =
      request.nextUrl.searchParams.get("category") ?? "전체";
    const pageParam = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const pageSizeParam = Number(
      request.nextUrl.searchParams.get("page_size") ?? "10"
    );

    // 선택된 테마에 맞는 카테고리 목록 가져오기
    const validCategories = ["전체", ...(THEME_CATEGORIES[rawTheme] || [])];
    const category = validCategories.includes(categoryParam) ? (categoryParam as Category) : "전체";
    const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
    const pageSize =
      Number.isFinite(pageSizeParam) &&
      pageSizeParam >= 1 &&
      pageSizeParam <= 20
        ? pageSizeParam
        : 10;

    const data = await getThemeNewsPage({
      theme: rawTheme,
      category,
      page,
      pageSize,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[theme-news-route]", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "뉴스 데이터를 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}