import { cacheLife } from "next/cache";
import { Category, Theme, ThemeNewsResponse } from "@/types/news";
import {
  buildPagedResponse,
  buildSummary,
  CACHE_TTL_SECONDS,
  computeRelevanceScore,
  dedupeNewsItems,
  inferCategory,
  MAX_CANDIDATES,
  nowKstDateString,
  nowKstIsoString,
  THEME_COLLECTION_PROFILES,
  ThemeCacheDocument,
} from "@/server/news/shared";
import {
  collectTodayNewsUntilOld,
  collectTodayNewsUntilOldBypassingCache,
} from "@/server/news/naver";

function canonicalUrl(item: { originallink: string; link: string }) {
  return (item.originallink || item.link || "").trim();
}

async function buildThemeCacheDocument(
  theme: Theme,
  options?: {
    bypassNaverCache?: boolean;
  }
): Promise<ThemeCacheDocument> {
  const bypassNaverCache = options?.bypassNaverCache ?? false;

  const profile = THEME_COLLECTION_PROFILES[theme];
  const collectedByQueries = await Promise.all(
    profile.queries.map(async (query) => {
      const result = bypassNaverCache
        ? await collectTodayNewsUntilOldBypassingCache(query)
        : await collectTodayNewsUntilOld(query);

      console.log(
        `[collect-theme-news-query] theme=${theme} query=${query} bypassNaverCache=${bypassNaverCache} collected=${result.items.length} total=${result.total}`
      );

      return result.items.map((item) => ({
        ...item,
        matched_query: query,
        url: canonicalUrl(item),
      }));
    })
  );

  const mergedCandidates = collectedByQueries.flat();

  const dedupedCandidates = dedupeNewsItems(mergedCandidates).slice(
    0,
    MAX_CANDIDATES
  );

  console.log(
    `[collect-theme-news-merge] theme=${theme} bypassNaverCache=${bypassNaverCache} mergedCandidates=${mergedCandidates.length} dedupedCandidates=${dedupedCandidates.length} maxCandidates=${MAX_CANDIDATES}`
  );

  const rankedArticles = dedupedCandidates
    .map((item) => {
      const category = inferCategory(item.title, item.description, theme);
      const relevanceScore = computeRelevanceScore(
        theme,
        item.title,
        item.description,
        item.pubDate,
        category
      );

      return {
        theme,
        title: item.title,
        source: "네이버 뉴스 검색",
        publisher: null,
        publishedAt: item.pubDate,
        category,
        summary: item.description,
        url: item.url,
        relevance_score: relevanceScore,
        matched_query: item.matched_query ?? null,
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
    new Date(fetchedAt).getTime() + CACHE_TTL_SECONDS * 1000
  ).toISOString();

  return {
    theme,
    queries: profile.queries,
    date: nowKstDateString(),
    fetched_at: fetchedAt,
    expires_at: expiresAt,
    candidate_count: mergedCandidates.length,
    article_count: rankedArticles.length,
    summary: buildSummary(theme, rankedArticles),
    articles: rankedArticles,
  };
}

async function collectThemeNewsCached(theme: Theme): Promise<ThemeCacheDocument> {
  "use cache: remote";

  cacheLife({
    revalidate: CACHE_TTL_SECONDS,
  });

  console.log(
    `[collect-theme-news] theme=${theme} mode=cached at=${new Date().toISOString()}`
  );

  return buildThemeCacheDocument(theme, {
    bypassNaverCache: false,
  });
}

async function collectThemeNewsFresh(theme: Theme): Promise<ThemeCacheDocument> {
  console.log(
    `[collect-theme-news] theme=${theme} mode=fresh-bypass at=${new Date().toISOString()}`
  );

  return buildThemeCacheDocument(theme, {
    bypassNaverCache: true,
  });
}

async function collectThemeNews(theme: Theme): Promise<ThemeCacheDocument> {
  const cachedDoc = await collectThemeNewsCached(theme);

  if (cachedDoc.article_count > 0) {
    return cachedDoc;
  }

  console.log(
    `[collect-theme-news] theme=${theme} cached-result-empty=true fetched_at=${cachedDoc.fetched_at} expires_at=${cachedDoc.expires_at} fallback=fresh-bypass`
  );

  return collectThemeNewsFresh(theme);
}

export async function getThemeNewsPage(params: {
  theme: Theme;
  category: Category;
  page: number;
  pageSize: number;
}): Promise<ThemeNewsResponse> {
  const { theme, category, page, pageSize } = params;

  const cacheDoc = await collectThemeNews(theme);

  console.log(
    `[get-theme-news-page] theme=${theme} category=${category} page=${page} pageSize=${pageSize} fetched_at=${cacheDoc.fetched_at} expires_at=${cacheDoc.expires_at} candidates=${cacheDoc.candidate_count} articles=${cacheDoc.article_count}`
  );

  return buildPagedResponse({
    theme,
    category,
    page,
    pageSize,
    cacheDoc,
  });
}
