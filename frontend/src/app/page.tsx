"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import NewsList from "@/components/NewsList";
import SummaryBox from "@/components/SummaryBox";
import ThemeSelector from "@/components/ThemeSelector";
import { getThemeNews } from "@/lib/api";
import { Category, NewsItem, Theme } from "@/types/news";
import { THEME_CATEGORIES } from "@/server/news/shared";

const themes: Theme[] = [
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
const PAGE_SIZE = 10;

type CachedViewState = {
  articles: NewsItem[];
  summary: string;
  page: number;
  hasMore: boolean;
  totalArticles: number;
  generatedAt: string | null;
  expiresAt: string | null;
};

function makeViewKey(theme: Theme, category: Category) {
  return `${theme}__${category}`;
}

function formatGeneratedAt(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function isExpired(value?: string | null) {
  if (!value) return true;

  const expiresAt = new Date(value);
  if (Number.isNaN(expiresAt.getTime())) return true;

  return Date.now() >= expiresAt.getTime();
}

export default function HomePage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("반도체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [summary, setSummary] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [today, setToday] = useState("");

  const categories = ["전체", ...THEME_CATEGORIES[selectedTheme]] as Category[];

  const observerRef = useRef<HTMLDivElement | null>(null);
  const viewCacheRef = useRef<Record<string, CachedViewState>>({});
  const filterRequestSeqRef = useRef(0);
  const loadMoreRequestSeqRef = useRef(0);

  const currentViewKey = useMemo(
    () => makeViewKey(selectedTheme, selectedCategory),
    [selectedTheme, selectedCategory]
  );

  const formattedGeneratedAt = useMemo(
    () => formatGeneratedAt(generatedAt),
    [generatedAt]
  );

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const applyViewState = useCallback((view: CachedViewState) => {
    setArticles(view.articles);
    setSummary(view.summary);
    setPage(view.page);
    setHasMore(view.hasMore);
    setTotalArticles(view.totalArticles);
    setGeneratedAt(view.generatedAt);
  }, []);

  const clearVisibleNews = useCallback(() => {
    setArticles([]);
    setSummary("");
    setPage(1);
    setHasMore(false);
    setTotalArticles(0);
    setGeneratedAt(null);
  }, []);

  const loadFirstPageForCurrentView = useCallback(async () => {
    const requestId = ++filterRequestSeqRef.current;
    const cached = viewCacheRef.current[currentViewKey];
    const hasFreshCache = cached && !isExpired(cached.expiresAt);

    setErrorMessage("");

    if (hasFreshCache && cached) {
      applyViewState(cached);
      setIsLoadingView(false);
      return;
    }

    if (cached) {
      applyViewState(cached);
    } else {
      clearVisibleNews();
    }

    setIsLoadingView(true);

    try {
      const data = await getThemeNews(
        selectedTheme,
        selectedCategory,
        1,
        PAGE_SIZE
      );

      if (requestId !== filterRequestSeqRef.current) {
        return;
      }

      const nextView: CachedViewState = {
        articles: data.articles,
        summary: data.summary,
        page: 1,
        hasMore: data.has_more,
        totalArticles: data.total_articles,
        generatedAt: data.generated_at ?? null,
        expiresAt: data.expires_at ?? null,
      };

      viewCacheRef.current[currentViewKey] = nextView;
      applyViewState(nextView);
    } catch (error) {
      if (requestId !== filterRequestSeqRef.current) {
        return;
      }

      console.error(error);
      clearVisibleNews();
      setErrorMessage("새로운 뉴스를 불러오는 중 오류가 발생했습니다.");
    } finally {
      if (requestId === filterRequestSeqRef.current) {
        setIsLoadingView(false);
      }
    }
  }, [
    applyViewState,
    clearVisibleNews,
    currentViewKey,
    selectedTheme,
    selectedCategory,
  ]);

  const loadMorePage = useCallback(async () => {
    if (isLoadingView || isLoadingMore || !hasMore) {
      return;
    }

    const requestId = ++loadMoreRequestSeqRef.current;

    try {
      setIsLoadingMore(true);

      const nextPage = page + 1;
      const data = await getThemeNews(
        selectedTheme,
        selectedCategory,
        nextPage,
        PAGE_SIZE
      );

      if (requestId !== loadMoreRequestSeqRef.current) {
        return;
      }

      const mergedArticles = [...articles, ...data.articles];

      setArticles(mergedArticles);
      setPage(nextPage);
      setHasMore(data.has_more);
      setTotalArticles(data.total_articles);
      setGeneratedAt(data.generated_at ?? null);

      viewCacheRef.current[currentViewKey] = {
        articles: mergedArticles,
        summary,
        page: nextPage,
        hasMore: data.has_more,
        totalArticles: data.total_articles,
        generatedAt: data.generated_at ?? null,
        expiresAt: data.expires_at ?? null,
      };
    } catch (error) {
      if (requestId !== loadMoreRequestSeqRef.current) {
        return;
      }

      console.error(error);
    } finally {
      if (requestId === loadMoreRequestSeqRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [
    articles,
    currentViewKey,
    hasMore,
    isLoadingMore,
    isLoadingView,
    page,
    selectedTheme,
    selectedCategory,
    summary,
  ]);

  useEffect(() => {
    loadFirstPageForCurrentView();
  }, [loadFirstPageForCurrentView]);

  useEffect(() => {
    const target = observerRef.current;

    if (!target || !hasMore || isLoadingView) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          loadMorePage();
        }
      },
      {
        root: null,
        rootMargin: "200px 0px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingView, loadMorePage]);

  const handleSelectTheme = (theme: Theme) => {
    if (theme === selectedTheme) return;

    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedTheme(theme);
    setSelectedCategory("전체" as Category);
  };

  const handleSelectCategory = (category: Category) => {
    if (category === selectedCategory) return;

    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedCategory(category);
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-10">
      <p className="text-lg text-gray-500">{today}</p>

      <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
        오늘의 주식 테마 뉴스
      </h1>

      <p className="mt-4 text-lg leading-8 text-gray-700 sm:text-xl">
        원하는 테마를 선택하면 관련 뉴스 요약을 보여줍니다.
      </p>

      <section className="sticky top-0 z-40 mt-8 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="space-y-3 py-3">
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-3">
              <ThemeSelector
                themes={themes}
                selectedTheme={selectedTheme}
                onSelectTheme={handleSelectTheme}
                compact
              />

              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                compact
              />
            </div>
          </div>

          <div className="overflow-x-auto pt-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
              <span className="shrink-0 rounded-full bg-black px-3 py-1.5 text-sm font-semibold text-white">
                선택 테마: {selectedTheme}
              </span>

              <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                카테고리: {selectedCategory}
              </span>

              <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm text-gray-700 border border-gray-200">
                현재 {articles.length}건 표시 / 전체 {totalArticles}건
              </span>

              {formattedGeneratedAt && (
                <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm text-gray-700 border border-gray-200">
                  최근 수집: {formattedGeneratedAt}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {isLoadingView && articles.length === 0 ? (
        <section className="mt-6 space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-5 space-y-3">
              <div className="h-6 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-6 w-11/12 animate-pulse rounded bg-gray-100" />
              <div className="h-6 w-10/12 animate-pulse rounded bg-gray-100" />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-5 space-y-3">
              <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-10/12 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-9/12 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </section>
      ) : errorMessage && articles.length === 0 ? (
        <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {errorMessage}
        </section>
      ) : (
        <>
          <div className="mt-6">
            <SummaryBox
              theme={selectedTheme}
              category={selectedCategory}
              summary={summary}
              generatedAt={generatedAt}
            />
          </div>

          <div className="mt-6">
            <NewsList
              articles={articles}
              selectedTheme={selectedTheme}
              selectedCategory={selectedCategory}
              totalArticles={totalArticles}
            />
          </div>

          <div ref={observerRef} className="h-10" />

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {isLoadingMore
              ? "추가 뉴스를 불러오는 중입니다..."
              : hasMore
              ? "스크롤하면 다음 뉴스를 불러옵니다."
              : "오늘 날짜 기준으로 더 불러올 뉴스가 없습니다."}
          </div>
        </>
      )}
    </main>
  );
}
