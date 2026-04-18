import {
  CACHE_TTL_SECONDS,
  formatDateToKst,
  NAVER_MAX_START,
  NAVER_PAGE_SIZE,
  RawNaverNewsItem,
  isTodayKst,
  MAX_OLDER_PAGE_STREAK,
  STOP_ON_EMPTY_TODAY_PAGE,
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

export async function searchNaverNewsByQuery(
  query: string,
  display = NAVER_PAGE_SIZE,
  start = 1,
  options?: {
    bypassCache?: boolean;
  }
): Promise<{ total: number; display: number; items: RawNaverNewsItem[] }> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const bypassCache = options?.bypassCache ?? false;

  if (!clientId || !clientSecret) {
    throw new Error(
      "NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경변수가 설정되지 않았습니다."
    );
  }

  const params = new URLSearchParams({
    query,
    display: String(display),
    start: String(start),
    sort: "date",
  });

  const requestUrl = `${NAVER_NEWS_API_URL}?${params.toString()}`;

  console.log(
    `[naver-fetch] query=${query} start=${start} display=${display} bypassCache=${bypassCache} at=${new Date().toISOString()}`
  );

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
      Accept: "application/json",
    },
    cache: bypassCache ? "no-store" : "force-cache",
    ...(bypassCache
      ? {}
      : {
          next: {
            revalidate: CACHE_TTL_SECONDS,
          },
        }),
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

export async function collectTodayNewsUntilOld(query: string) {
  return collectTodayNewsUntilOldInternal(query, {
    bypassCache: false,
  });
}

export async function collectTodayNewsUntilOldBypassingCache(query: string) {
  return collectTodayNewsUntilOldInternal(query, {
    bypassCache: true,
  });
}

async function collectTodayNewsUntilOldInternal(
  query: string,
  options: {
    bypassCache: boolean;
  }
) {
  const allTodayItems: RawNaverNewsItem[] = [];
  let start = 1;
  let total = 0;
  let olderPageStreak = 0;
  let pagesFetched = 0;

  while (start <= NAVER_MAX_START) {
    const page = await searchNaverNewsByQuery(query, NAVER_PAGE_SIZE, start, {
      bypassCache: options.bypassCache,
    });
    pagesFetched += 1;

    total = page.total;

    if (!page.items.length) {
      console.log(
        `[naver-collect] query=${query} start=${start} bypassCache=${options.bypassCache} total=${total} pageItems=0 todayItems=0 olderPageStreak=${olderPageStreak} stop=empty-page`
      );
      break;
    }

    const todayItems = page.items.filter((item) => isTodayKst(item.pubDate));
    allTodayItems.push(...todayItems);

    const hasOlderItems = page.items.some((item) => !isTodayKst(item.pubDate));

    console.log(
      `[naver-collect] query=${query} start=${start} bypassCache=${options.bypassCache} total=${total} pageItems=${page.items.length} todayItems=${todayItems.length} accumulatedToday=${allTodayItems.length} hasOlderItems=${hasOlderItems} olderPageStreak=${olderPageStreak}`
    );

    if (todayItems.length === 0 && STOP_ON_EMPTY_TODAY_PAGE) {
      console.log(
        `[naver-collect] query=${query} start=${start} bypassCache=${options.bypassCache} stop=empty-today-page`
      );
      break;
    }

    if (hasOlderItems) {
      olderPageStreak += 1;
    } else {
      olderPageStreak = 0;
    }

    if (olderPageStreak > MAX_OLDER_PAGE_STREAK) {
      console.log(
        `[naver-collect] query=${query} start=${start} bypassCache=${options.bypassCache} stop=older-page-streak olderPageStreak=${olderPageStreak}`
      );
      break;
    }

    start += NAVER_PAGE_SIZE;
  }

  console.log(
    `[naver-collect-summary] query=${query} bypassCache=${options.bypassCache} total=${total} pagesFetched=${pagesFetched} todayItems=${allTodayItems.length}`
  );

  return {
    total,
    items: allTodayItems,
  };
}
