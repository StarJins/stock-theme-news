import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ theme: string }> }
) {
  try {
    if (!BACKEND_API_BASE_URL) {
      return NextResponse.json(
        { message: "BACKEND_API_BASE_URL 환경변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { theme } = await context.params;
    const search = request.nextUrl.searchParams.toString();

    const backendUrl = `${BACKEND_API_BASE_URL}/themes/${encodeURIComponent(
      theme
    )}/news?${search}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "백엔드 프록시 요청 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}