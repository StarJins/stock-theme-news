import { NextRequest, NextResponse } from "next/server";
import { Category, Theme } from "@/types/news";
import { THEME_CATEGORIES } from "@/constants/theme";

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

    // 파이썬 백엔드 API 호출 (로컬 개발: 8000포트, 배포 시: BACKEND_API_URL 환경변수 사용)
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
    const apiUrl = new URL(`${backendUrl}/api/themes/${encodeURIComponent(rawTheme)}/news`);
    apiUrl.searchParams.set("category", category);
    apiUrl.searchParams.set("page", page.toString());
    apiUrl.searchParams.set("page_size", pageSize.toString());

    const response = await fetch(apiUrl.toString(), {
      cache: "no-store", // Next.js 캐싱을 우회하고 항상 파이썬 백엔드의 최신 캐시를 사용
      signal: request.signal,
    });

    if (!response.ok) throw new Error(`백엔드 응답 오류: ${response.status}`);
    const data = await response.json();

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
