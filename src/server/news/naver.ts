import { Theme } from "@/types/news";
import {
  CACHE_TTL_SECONDS,
  formatDateToKst,
  RawNaverNewsItem,
  THEME_CONFIGS,
} from "@/server/news/shared";

const NAVER_NEWS_API_URL = "https://openapi.naver.com/v1/search/news.json";

function cleanText(text: string) {
  if (!text) return "";

  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parsePubDate(pubDate: string) {
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) {
    return pubDate;
  }
  return formatDateToKst(date);
}

export async function searchNaverNews(
  theme: Theme,
  display = 100,
  start = 1
): Promise<{ total: number; display: number; items: RawNaverNewsItem[] }> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경변수가 설정되지 않았습니다."
    );
  }

  const params = new URLSearchParams({
    query: THEME_CONFIGS[theme].query,
    display: String(display),
    start: String(start),
    sort: "date",
  });

  const response = await fetch(`${NAVER_NEWS_API_URL}?${params.toString()}`, {
    method: "GET",
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
      Accept: "application/json",
    },
    next: {
      revalidate: CACHE_TTL_SECONDS,
      tags: ["naver-news", `naver-news:${theme}`],
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`네이버 뉴스 API 요청 실패: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    total?: number;
    display?: number;
    items?: Array<{
      title?: string;
      originallink?: string;
      link?: string;
      description?: string;
      pubDate?: string;
    }>;
  };

  return {
    total: data.total ?? 0,
    display: data.display ?? display,
    items: (data.items ?? []).map((item) => ({
      title: cleanText(item.title ?? ""),
      originallink: item.originallink ?? "",
      link: item.link ?? "",
      description: cleanText(item.description ?? ""),
      pubDate: parsePubDate(item.pubDate ?? ""),
    })),
  };
}