import {
  Category,
  NewsCategory,
  NewsItem,
  Theme,
  ThemeNewsResponse,
} from "@/types/news";

export const KST_TIME_ZONE = "Asia/Seoul";
export const CACHE_TTL_SECONDS = Number(
  process.env.NEWS_CACHE_TTL_SECONDS ?? "600"
);
export const MAX_CANDIDATES = Number(
  process.env.NEWS_MAX_CANDIDATES ?? "100"
);

export type ThemeConfig = {
  query: string;
  label: Theme;
  keywords: {
    primary: string[];
    secondary: string[];
    negative: string[];
  };
};

export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  반도체: {
    query: "반도체",
    label: "반도체",
    keywords: {
      primary: [
        "반도체",
        "hbm",
        "메모리",
        "파운드리",
        "dram",
        "낸드",
        "sk하이닉스",
        "삼성전자",
      ],
      secondary: [
        "칩",
        "웨이퍼",
        "패키징",
        "ai 반도체",
        "고대역폭메모리",
        "micron",
        "tsmc",
      ],
      negative: ["피부", "화장품", "치과", "반도체등"],
    },
  },
  AI: {
    query: "인공지능",
    label: "AI",
    keywords: {
      primary: [
        "인공지능",
        "ai",
        "생성형 ai",
        "llm",
        "모델",
        "추론",
        "학습",
        "gpu",
        "챗gpt",
        "오픈ai",
      ],
      secondary: [
        "에이전트",
        "멀티모달",
        "파인튜닝",
        "온디바이스 ai",
        "데이터센터",
        "npu",
      ],
      negative: ["a.i", "아이"],
    },
  },
  방산: {
    query: "방산",
    label: "방산",
    keywords: {
      primary: [
        "방산",
        "국방",
        "방위산업",
        "무기",
        "무기수출",
        "전투기",
        "미사일",
        "잠수함",
        "한화에어로스페이스",
      ],
      secondary: [
        "k9",
        "fa-50",
        "천궁",
        "l-sam",
        "군수",
        "방위사업청",
        "함정",
      ],
      negative: ["방산시장", "부동산"],
    },
  },
};

export const CATEGORY_RULES: Record<
  Exclude<NewsCategory, never>,
  string[]
> = {
  정치: [
    "정부",
    "정책",
    "국회",
    "규제",
    "예산",
    "대통령",
    "장관",
    "국정",
    "외교",
    "법안",
  ],
  사회: [
    "고용",
    "교육",
    "인력",
    "사회",
    "현장",
    "노조",
    "안전",
    "사고",
    "채용",
    "산재",
  ],
  경제: [],
};

const WORD_RE = /[\w가-힣\-]+/g;

function getKstDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function nowKstIsoString() {
  const now = new Date();
  const parts = getKstDateParts(now);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+09:00`;
}

export function nowKstDateString() {
  const now = new Date();
  const parts = getKstDateParts(now);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatDateToKst(date: Date) {
  const parts = getKstDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

export function isTodayKst(publishedAt: string) {
  return publishedAt.slice(0, 10) === nowKstDateString();
}

export function inferCategory(
  title: string,
  description: string
): NewsCategory {
  const text = `${title} ${description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(
    CATEGORY_RULES
  ) as [NewsCategory, string[]][]) {
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return category;
    }
  }

  return "경제";
}

export function computeRelevanceScore(
  theme: Theme,
  title: string,
  description: string,
  publishedAt: string
) {
  const config = THEME_CONFIGS[theme];
  const titleL = title.toLowerCase();
  const descL = description.toLowerCase();
  let score = 0;

  for (const keyword of config.keywords.primary) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) score += 6;
    if (descL.includes(normalized)) score += 2.5;
  }

  for (const keyword of config.keywords.secondary) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) score += 3;
    if (descL.includes(normalized)) score += 1;
  }

  for (const keyword of config.keywords.negative) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) score -= 4;
    if (descL.includes(normalized)) score -= 1.5;
  }

  const titleTokens = titleL.match(WORD_RE) ?? [];
  if (titleTokens.length > 0) {
    const keywordSet = new Set(
      [...config.keywords.primary, ...config.keywords.secondary].map((keyword) =>
        keyword.toLowerCase()
      )
    );

    const uniqueMatches = [...new Set(titleTokens)].filter((token) =>
      keywordSet.has(token)
    ).length;
    score += Math.min(uniqueMatches * 0.7, 2.8);
  }

  const publishedDate = new Date(`${publishedAt.replace(" ", "T")}:00+09:00`);
  if (!Number.isNaN(publishedDate.getTime())) {
    const diffMinutes = Math.max(
      (Date.now() - publishedDate.getTime()) / 1000 / 60,
      0
    );
    score += Math.max(4 - diffMinutes / 120, 0);
  }

  return Number(score.toFixed(2));
}

export function dedupeNewsItems<T extends { title: string; url: string }>(
  items: T[]
) {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const deduped: T[] = [];

  for (const item of items) {
    const titleKey = item.title.replace(/\s+/g, " ").trim().toLowerCase();
    if (item.url && seenUrls.has(item.url)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;

    if (item.url) seenUrls.add(item.url);
    if (titleKey) seenTitles.add(titleKey);
    deduped.push(item);
  }

  return deduped;
}

export type RawNaverNewsItem = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
};

export type ThemeCacheDocument = {
  theme: Theme;
  query: string;
  date: string;
  fetched_at: string;
  expires_at: string;
  candidate_count: number;
  article_count: number;
  summary: string;
  articles: Array<
    Omit<NewsItem, "id" | "relevanceScore"> & { relevance_score?: number | null }
  >;
};

export function buildSummary(
  theme: Theme,
  articles: ThemeCacheDocument["articles"]
) {
  if (articles.length === 0) {
    return `오늘 ${theme} 테마 관련 오늘 날짜 기사를 찾지 못했습니다.`;
  }

  const topTitles = articles.slice(0, 3).map((article) => article.title);
  return `오늘 ${theme} 테마 기사 ${articles.length}건을 수집했고, 상위 이슈는 ${topTitles.join(
    "; "
  )} 입니다.`;
}

export function buildPagedResponse(params: {
  theme: Theme;
  category: Category;
  page: number;
  pageSize: number;
  cacheDoc: ThemeCacheDocument;
}): ThemeNewsResponse {
  const { theme, category, page, pageSize, cacheDoc } = params;
  let articles = cacheDoc.articles;

  if (category !== "전체") {
    articles = articles.filter((article) => article.category === category);
  }

  const totalArticles = articles.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const pageArticles = articles.slice(startIndex, endIndex).map((article, index) => ({
    ...article,
    id: startIndex + index + 1,
    relevanceScore: article.relevance_score ?? null,
  }));

  return {
    theme,
    category,
    summary: cacheDoc.summary || buildSummary(theme, articles),
    articles: pageArticles,
    page,
    page_size: pageSize,
    has_more: endIndex < totalArticles,
    total_articles: totalArticles,
    generated_at: cacheDoc.fetched_at,
    expires_at: cacheDoc.expires_at,
    cache_hit: true,
  };
}