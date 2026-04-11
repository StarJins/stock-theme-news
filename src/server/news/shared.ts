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
      "방위산업",
      "K방산",
      "무기 수출",
      "방산 수주",
      "FA-50",
      "K9 자주포",
      "천궁",
    ],
  },
  원전: {
    label: "원전",
    queries: [
      "원전",
      "원전 수출",
      "원전 수주",
      "SMR",
      "소형모듈원전",
      "한국수력원자력",
      "원자력 체코",
    ],
  },
  배터리: {
    label: "배터리",
    queries: [
      "이차전지",
      "배터리",
      "전고체",
      "LFP",
      "LG에너지솔루션",
      "삼성SDI",
      "SK온",
      "배터리 캐즘",
    ],
  },
  건설: {
    label: "건설",
    queries: [
      "건설사",
      "건설사 수주",
      "부동산PF",
      "재건축",
      "재개발",
      "해외건설",
      "분양",
    ],
  },
  부동산: {
    label: "부동산",
    queries: [
      "부동산",
      "아파트값",
      "집값",
      "전세 매매",
      "부동산 청약",
      "아파트 분양",
      "부동산 정책",
      "대출규제",
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
  원전: {
    primary: ["원전", "원자력", "smr", "체코", "원자로", "소형모듈원전"],
    secondary: ["수출", "수주", "원안위", "생태계", "발전소", "우라늄"],
    negative: ["원전사고", "오염수", "방사능 누출"],
    entities: ["한국수력원자력", "한수원", "두산에너빌리티", "한국전력", "한전기술"],
    categoryHints: {
      경제: ["수출", "수주", "계약", "투자", "실적", "협상"],
      사회: ["안전", "주민", "환경", "일자리"],
      정치: ["정부", "정책", "지원", "예산", "대통령", "원자력안전위원회"],
    },
  },
  배터리: {
    primary: ["배터리", "이차전지", "2차전지", "전고체", "lfp", "리튬", "양극재", "음극재"],
    secondary: ["전기차", "캐즘", "수율", "공급망", "ess", "셀", "광물"],
    negative: ["배터리 방전", "휴대폰 배터리", "폭행", "폭발"],
    entities: ["lg에너지솔루션", "삼성sdi", "sk온", "에코프로", "포스코퓨처엠", "엘지에너지솔루션"],
    categoryHints: {
      경제: ["실적", "투자", "수출", "점유율", "매출", "수주", "캐즘", "보조금"],
      사회: ["화재", "안전", "채용", "노조"],
      정치: ["ira", "관세", "정책", "정부", "지원", "규제"],
    },
  },
  건설: {
    primary: ["건설", "건설사", "수주", "재건축", "재개발", "pf", "부동산pf", "분양"],
    secondary: ["착공", "시공", "미분양", "해외건설", "정비사업", "청약"],
    negative: ["건설기계", "불법하도급", "부실시공", "철근 누락"],
    entities: ["현대건설", "gs건설", "대우건설", "삼성물산", "dl이앤씨", "hdc현대산업개발"],
    categoryHints: {
      경제: ["실적", "수주", "미분양", "유동성", "매출", "영업이익", "pf"],
      사회: ["안전", "사고", "노조", "파업", "현장"],
      정치: ["국토교통부", "국토부", "정책", "법안", "규제", "지원"],
    },
  },
  부동산: {
    primary: ["부동산", "아파트", "집값", "전세", "월세", "청약", "분양", "매매", "주택"],
    secondary: ["대출", "금리", "규제지역", "디딤돌", "보금자리론", "ltv", "dsr", "임대차", "전세사기"],
    negative: ["기획부동산", "사기꾼", "살인", "폭행", "사건"],
    entities: ["국토교통부", "한국부동산원", "주택도시보증공사", "hug", "국토부"],
    categoryHints: {
      경제: ["가격", "매매", "거래량", "전세가", "월세가", "금리", "대출", "분양가"],
      사회: ["전세사기", "임대인", "세입자", "피해", "청년"],
      정치: ["정책", "규제", "공급", "대책", "법안", "국토부", "세금", "종부세"],
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

export function convertRelevanceScoreToPercent(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) return null;

  // 현재 점수 체계 기준 사용자용 정규화
  const center = 12;
  const scale = 4;

  const percent = 100 / (1 + Math.exp(-(score - center) / scale));
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export function getRelevanceLabel(percent: number | null | undefined) {
  if (percent == null) return null;
  if (percent >= 85) return "매우 높음";
  if (percent >= 70) return "높음";
  if (percent >= 50) return "보통";
  if (percent >= 30) return "낮음";
  return "매우 낮음";
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

export type ThemeCacheArticle = Omit<
  NewsItem,
  "id" | "relevanceScore" | "relevancePercent" | "relevanceLabel"
> & {
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

  const pageArticles = articles.slice(startIndex, endIndex).map((article, index) => {
    const relevanceScore = article.relevance_score ?? null;
    const relevancePercent = convertRelevanceScoreToPercent(relevanceScore);
    const relevanceLabel = getRelevanceLabel(relevancePercent);

    return {
      ...article,
      id: startIndex + index + 1,
      relevanceScore,
      relevancePercent,
      relevanceLabel,
      publisher: article.publisher ?? null,
      matchedQuery: article.matched_query ?? null,
    };
  });

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