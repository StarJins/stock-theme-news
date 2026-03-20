import { unstable_cache } from "next/cache";
import { Category, Theme, ThemeNewsResponse } from "@/types/news";
import {
  buildPagedResponse,
  buildSummary,
  CACHE_TTL_SECONDS,
  computeRelevanceScore,
  dedupeNewsItems,
  inferCategory,
  isTodayKst,
  MAX_CANDIDATES,
  nowKstDateString,
  nowKstIsoString,
  THEME_CONFIGS,
  ThemeCacheDocument,
} from "@/server/news/shared";
import { searchNaverNews } from "@/server/news/naver";

function canonicalUrl(item: { originallink: string; link: string }) {
  return (item.originallink || item.link || "").trim();
}

async function collectThemeNews(theme: Theme): Promise<ThemeCacheDocument> {
  const result = await searchNaverNews(theme, Math.min(MAX_CANDIDATES, 100), 1);

  const todayCandidates = result.items.filter((item) =>
    isTodayKst(item.pubDate)
  );

  const dedupedCandidates = dedupeNewsItems(
    todayCandidates.map((item) => ({
      ...item,
      url: canonicalUrl(item),
    }))
  );

  const rankedArticles = dedupedCandidates
    .map((item) => {
      const category = inferCategory(item.title, item.description);
      const relevanceScore = computeRelevanceScore(
        theme,
        item.title,
        item.description,
        item.pubDate
      );

      return {
        theme,
        title: item.title,
        source: "네이버 뉴스 검색",
        publishedAt: item.pubDate,
        category,
        summary: item.description,
        url: item.url,
        relevance_score: relevanceScore,
      };
    })
    .sort((a, b) => {
      if ((b.relevance_score ?? 0) !== (a.relevance_score ?? 0)) {
        return (b.relevance_score ?? 0) - (a.relevance_score ?? 0);
      }
      return b.publishedAt.localeCompare(a.publishedAt);
    });

  const fetchedAt = nowKstIsoString();
  const expiresAt = new Date(
    new Date(nowKstIsoString()).getTime() + CACHE_TTL_SECONDS * 1000
  ).toISOString();

  return {
    theme,
    query: THEME_CONFIGS[theme].query,
    date: nowKstDateString(),
    fetched_at: fetchedAt,
    expires_at: expiresAt,
    candidate_count: Math.min(result.display, MAX_CANDIDATES),
    article_count: rankedArticles.length,
    summary: buildSummary(theme, rankedArticles),
    articles: rankedArticles,
  };
}

const cachedThemeCollectors: Record<Theme, () => Promise<ThemeCacheDocument>> = {
  반도체: unstable_cache(() => collectThemeNews("반도체"), ["theme-news", "반도체"], {
    revalidate: CACHE_TTL_SECONDS,
    tags: ["theme-news", "theme-news:반도체"],
  }),
  AI: unstable_cache(() => collectThemeNews("AI"), ["theme-news", "AI"], {
    revalidate: CACHE_TTL_SECONDS,
    tags: ["theme-news", "theme-news:AI"],
  }),
  방산: unstable_cache(() => collectThemeNews("방산"), ["theme-news", "방산"], {
    revalidate: CACHE_TTL_SECONDS,
    tags: ["theme-news", "theme-news:방산"],
  }),
};

export async function getThemeNewsPage(params: {
  theme: Theme;
  category: Category;
  page: number;
  pageSize: number;
}): Promise<ThemeNewsResponse> {
  const { theme, category, page, pageSize } = params;
  const cacheDoc = await cachedThemeCollectors[theme]();

  return buildPagedResponse({
    theme,
    category,
    page,
    pageSize,
    cacheDoc,
  });
}