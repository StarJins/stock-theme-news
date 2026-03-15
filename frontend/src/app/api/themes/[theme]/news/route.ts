import { NextRequest, NextResponse } from "next/server";

const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL;

function buildBackendUrl(theme: string, searchParams: URLSearchParams) {
  if (!backendApiBaseUrl) {
    throw new Error("BACKEND_API_BASE_URL environment variable is missing.");
  }

  const normalizedBaseUrl = backendApiBaseUrl.replace(/\/$/, "");
  const url = new URL(
    `${normalizedBaseUrl}/themes/${encodeURIComponent(theme)}/news`
  );

  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return url;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ theme: string }> }
) {
  try {
    const { theme } = await context.params;
    const backendUrl = buildBackendUrl(theme, request.nextUrl.searchParams);

    const response = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return NextResponse.json(
        {
          message: "백엔드 응답 형식이 올바르지 않습니다.",
          detail: text,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("[theme-news-proxy]", error);

    return NextResponse.json(
      { message: "백엔드 프록시 요청 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
