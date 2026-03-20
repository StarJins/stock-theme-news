import { NextRequest, NextResponse } from "next/server";
import { getThemeNewsPage } from "@/server/news/service";
import { Category, Theme } from "@/types/news";

export const runtime = "nodejs";
export const preferredRegion = ["hnd1"];

const THEMES: Theme[] = ["반도체", "AI", "방산"];
const CATEGORIES: Category[] = ["전체", "경제", "사회", "정치"];

function isTheme(value: string): value is Theme {
  return THEMES.includes(value as Theme);
}

function isCategory(value: string): value is Category {
  return CATEGORIES.includes(value as Category);
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

    const category = isCategory(categoryParam) ? categoryParam : "전체";
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