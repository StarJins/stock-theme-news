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

// 테마당 최종 후보 최대치
export const MAX_CANDIDATES = Number(
  process.env.NEWS_MAX_CANDIDATES ?? "1000"
);

// 네이버 검색 API 제약: display 최대 100, start 최대 1000
export const NAVER_PAGE_SIZE = 100;
export const NAVER_MAX_START = 1000;

// 오늘 기사 수집 중, "이 페이지에 오늘 기사가 하나도 없으면 종료"
export const STOP_ON_EMPTY_TODAY_PAGE = true;

// 추가 안전장치: 연속으로 오래된 기사 페이지가 몇 번 나오면 종료
export const MAX_OLDER_PAGE_STREAK = 1;

export type ThemeCollectionProfile = {
  label: Theme;
  queries: string[];
};

export type ThemeScoringProfile = {
  primary: string[];
  secondary: string[];
  negative: string[];
  entities: string[];
  categoryHints: Record<NewsCategory, string[]>;
};

export const THEME_COLLECTION_PROFILES: Record<
  Theme,
  ThemeCollectionProfile
> = {
  반도체: {
    label: "반도체",
    queries: [
      "반도체",
      "HBM DRAM 낸드 파운드리",
      "삼성전자 SK하이닉스 TSMC Micron 반도체",
      "반도체 정책 반도체 규제 반도체 지원",
    ],
  },
  AI: {
    label: "AI",
    queries: [
      "인공지능",
      "생성형 AI LLM 멀티모달",
      "챗GPT 오픈AI GPU NPU AI 반도체",
      "AI 정책 AI 규제 AI 데이터센터",
    ],
  },
  방산: {
    label: "방산",
    queries: [
      "방산",
      "국방 방위산업 무기수출",
      "FA-50 K9 천궁 L-SAM 잠수함 전투기",
      "방산 정책 국방 예산 방산 수출",
    ],
  },
};

export const THEME_SCORING_PROFILES: Record<Theme, ThemeScoringProfile> = {
  반도체: {
    primary: [
      "반도체",
      "hbm",
      "메모리",
      "dram",
      "낸드",
      "파운드리",
      "웨이퍼",
      "패키징",
      "ai 반도체",
    ],
    secondary: [
      "칩",
      "후공정",
      "전공정",
      "수율",
      "증설",
      "fab",
      "고대역폭메모리",
    ],
    negative: ["피부", "치과", "화장품", "반도체등"],
    entities: ["삼성전자", "sk하이닉스", "tsmc", "micron", "인텔", "amd", "엔비디아"],
    categoryHints: {
      경제: ["실적", "수출", "투자", "증설", "매출", "영업이익", "점유율", "공급망"],
      사회: ["채용", "인력", "산재", "노조", "현장", "교육"],
      정치: ["정부", "정책", "규제", "법안", "예산", "지원", "국회"],
    },
  },
  AI: {
    primary: [
      "인공지능",
      "ai",
      "생성형 ai",
      "llm",
      "멀티모달",
      "추론",
      "학습",
      "모델",
      "챗gpt",
      "오픈ai",
    ],
    secondary: [
      "에이전트",
      "파인튜닝",
      "온디바이스 ai",
      "데이터센터",
      "gpu",
      "npu",
      "클라우드",
    ],
    negative: ["a.i", "아이"],
    entities: ["오픈ai", "google", "구글", "meta", "메타", "microsoft", "ms", "엔비디아"],
    categoryHints: {
      경제: ["투자", "매출", "기업", "서비스", "시장", "수익화", "도입"],
      사회: ["교육", "저작권", "일자리", "윤리", "안전", "학교"],
      정치: ["정책", "규제", "정부", "법안", "대통령", "국회", "국가전략"],
    },
  },
  방산: {
    primary: [
      "방산",
      "국방",
      "방위산업",
      "무기",
      "무기수출",
      "전투기",
      "미사일",
      "잠수함",
      "군수",
    ],
    secondary: [
      "k9",
      "fa-50",
      "천궁",
      "l-sam",
      "함정",
      "장갑차",
      "탄약",
      "전력화",
    ],
    negative: ["부동산", "방산시장"],
    entities: [
      "한화에어로스페이스",
      "현대로템",
      "한국항공우주",
      "lig넥스원",
      "방위사업청",
    ],
    categoryHints: {
      경제: ["수출", "계약", "수주", "매출", "투자", "생산", "해외"],
      사회: ["병력", "안전", "훈련", "현장", "인력"],
      정치: ["국방부", "정부", "예산", "정책", "외교", "안보", "국회"],
    },
  },
};

export const CATEGORY_RULES: Record<NewsCategory, string[]> = {
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
    "국방부",
    "산업부",
    "과기정통부",
    "공정위",
    "금감원",
    "청문회",
    "지원",
    "제재",
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
    "학교",
    "학생",
    "교사",
    "직원",
    "근로자",
    "노동",
  ],
  경제: [
    "실적",
    "투자",
    "수출",
    "수입",
    "매출",
    "영업이익",
    "증설",
    "공장",
    "시장",
    "점유율",
    "공급망",
    "주가",
    "계약",
    "수주",
    "생산",
    "가격",
  ],
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

export function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeTitle(title: string) {
  return normalizeWhitespace(
    title
      .replace(/^\[(속보|단독|종합|인터뷰|현장|오피셜)\]\s*/gi, "")
      .replace(/\((종합|상보|속보|사진|영상)\)$/gi, "")
      .replace(/\[[^\]]+\]\s*$/g, "")
      .replace(/【[^】]+】/g, "")
      .replace(/[“”"'`]/g, "")
      .replace(/[|·]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}

export function normalizeUrl(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    parsed.hash = "";

    const blockedParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ];

    for (const key of blockedParams) {
      parsed.searchParams.delete(key);
    }

    const normalized = parsed.toString().replace(/\/$/, "");
    return normalized;
  } catch {
    return url.trim();
  }
}

function tokenSet(text: string) {
  return new Set((normalizeTitle(text).match(WORD_RE) ?? []).filter(Boolean));
}

function jaccardSimilarity(a: string, b: string) {
  const aSet = tokenSet(a);
  const bSet = tokenSet(b);

  if (aSet.size === 0 && bSet.size === 0) return 1;
  if (aSet.size === 0 || bSet.size === 0) return 0;

  let intersection = 0;

  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }

  const union = aSet.size + bSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function inferCategory(
  title: string,
  description: string,
  theme?: Theme
): NewsCategory {
  const text = `${title} ${description}`.toLowerCase();

  const scores: Record<NewsCategory, number> = {
    경제: 0,
    사회: 0,
    정치: 0,
  };

  for (const [category, keywords] of Object.entries(
    CATEGORY_RULES
  ) as [NewsCategory, string[]][]) {
    for (const keyword of keywords) {
      const needle = keyword.toLowerCase();
      if (text.includes(needle)) {
        scores[category] += 2;
      }
    }
  }

  if (theme) {
    for (const [category, keywords] of Object.entries(
      THEME_SCORING_PROFILES[theme].categoryHints
    ) as [NewsCategory, string[]][]) {
      for (const keyword of keywords) {
        const needle = keyword.toLowerCase();
        if (text.includes(needle)) {
          scores[category] += 1.5;
        }
      }
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestCategory, bestScore] = sorted[0] as [NewsCategory, number];
  const secondScore = sorted[1]?.[1] ?? 0;

  if (bestScore <= 0) return "경제";
  if (bestScore - secondScore < 1) return "경제";

  return bestCategory;
}

export function computeRelevanceScore(
  theme: Theme,
  title: string,
  description: string,
  publishedAt: string,
  category?: NewsCategory
) {
  const profile = THEME_SCORING_PROFILES[theme];
  const titleL = title.toLowerCase();
  const descL = description.toLowerCase();

  let titleMatchScore = 0;
  let descriptionMatchScore = 0;
  let entityScore = 0;
  let categoryFitScore = 0;
  let noisePenalty = 0;
  let recencyScore = 0;

  for (const keyword of profile.primary) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) titleMatchScore += 6;
    if (descL.includes(normalized)) descriptionMatchScore += 2.5;
  }

  for (const keyword of profile.secondary) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) titleMatchScore += 3;
    if (descL.includes(normalized)) descriptionMatchScore += 1.2;
  }

  for (const keyword of profile.entities) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) entityScore += 2.5;
    if (descL.includes(normalized)) entityScore += 1;
  }

  for (const keyword of profile.negative) {
    const normalized = keyword.toLowerCase();
    if (titleL.includes(normalized)) noisePenalty += 5;
    if (descL.includes(normalized)) noisePenalty += 2;
  }

  if (category) {
    const hints = profile.categoryHints[category] ?? [];
    for (const keyword of hints) {
      const normalized = keyword.toLowerCase();
      if (titleL.includes(normalized)) categoryFitScore += 1.5;
      if (descL.includes(normalized)) categoryFitScore += 0.8;
    }
  }

  const titleTokens = titleL.match(WORD_RE) ?? [];
  if (titleTokens.length > 0) {
    const keywordSet = new Set(
      [...profile.primary, ...profile.secondary, ...profile.entities].map((k) =>
        k.toLowerCase()
      )
    );

    const uniqueMatches = [...new Set(titleTokens)].filter((token) =>
      keywordSet.has(token)
    ).length;

    titleMatchScore += Math.min(uniqueMatches * 0.8, 4);
  }

  const publishedDate = new Date(`${publishedAt.replace(" ", "T")}:00+09:00`);
  if (!Number.isNaN(publishedDate.getTime())) {
    const diffMinutes = Math.max(
      (Date.now() - publishedDate.getTime()) / 1000 / 60,
      0
    );
    recencyScore = Math.max(4 - diffMinutes / 180, 0);
  }

  const finalScore =
    titleMatchScore +
    descriptionMatchScore +
    entityScore +
    categoryFitScore +
    recencyScore -
    noisePenalty;

  return Number(finalScore.toFixed(2));
}

export function dedupeNewsItems<
  T extends {
    title: string;
    url: string;
    originallink?: string;
    link?: string;
  }
>(items: T[]) {
  const deduped: T[] = [];
  const seenUrls = new Set<string>();
  const seenTitleKeys = new Set<string>();

  for (const item of items) {
    const urlKey = normalizeUrl(item.originallink || item.link || item.url || "");
    const titleKey = normalizeTitle(item.title);

    if (urlKey && seenUrls.has(urlKey)) continue;
    if (titleKey && seenTitleKeys.has(titleKey)) continue;

    const nearDup = deduped.find((existing) => {
      const sim = jaccardSimilarity(existing.title, item.title);
      return sim >= 0.85;
    });

    if (nearDup) continue;

    if (urlKey) seenUrls.add(urlKey);
    if (titleKey) seenTitleKeys.add(titleKey);

    deduped.push({
      ...item,
      url: urlKey || item.url,
    });
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

export type ThemeCacheArticle = Omit<NewsItem, "id" | "relevanceScore"> & {
  relevance_score?: number | null;
  matched_query?: string | null;
};

export type ThemeCacheDocument = {
  theme: Theme;
  queries: string[];
  date: string;
  fetched_at: string;
  expires_at: string;
  candidate_count: number;
  article_count: number;
  summary: string;
  articles: ThemeCacheArticle[];
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
    publisher: article.publisher ?? null,
    matchedQuery: article.matched_query ?? null,
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