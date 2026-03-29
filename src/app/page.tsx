"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import NewsList from "@/components/NewsList";
import SummaryBox from "@/components/SummaryBox";
import ThemeSelector from "@/components/ThemeSelector";
import { getThemeNews } from "@/lib/api";
import { Category, NewsItem, Theme } from "@/types/news";

const themes: Theme[] = ["반도체", "AI", "방산"];
const categories: Category[] = ["전체", "경제", "사회", "정치"];
const PAGE_SIZE = 10;

type CachedViewState = {
  articles: NewsItem[];
  summary: string;
  page: number;
  hasMore: boolean;
  totalArticles: number;
  generatedAt: string | null;
};

function makeViewKey(theme: Theme, category: Category) {
  return `${theme}__${category}`;
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

  // 로딩 중에도 페이지 높이 유지
  const [reservedContentHeight, setReservedContentHeight] = useState<number>(0);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const contentAreaRef = useRef<HTMLDivElement | null>(null);
  const viewCacheRef = useRef<Record<string, CachedViewState>>({});
  const filterRequestSeqRef = useRef(0);
  const loadMoreRequestSeqRef = useRef(0);
  const scrollRestoreYRef = useRef<number | null>(null);

  const currentViewKey = useMemo(
    () => makeViewKey(selectedTheme, selectedCategory),
    [selectedTheme, selectedCategory]
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

  const measureCurrentContentHeight = useCallback(() => {
    const el = contentAreaRef.current;
    if (!el) return 0;
    return Math.max(el.getBoundingClientRect().height, el.scrollHeight, 0);
  }, []);

  const preserveScrollPosition = useCallback(() => {
    scrollRestoreYRef.current = window.scrollY;

    requestAnimationFrame(() => {
      if (scrollRestoreYRef.current != null) {
        window.scrollTo({
          top: scrollRestoreYRef.current,
          behavior: "auto",
        });
      }
    });
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

    setErrorMessage("");

    if (cached) {
      applyViewState(cached);
      setIsLoadingView(false);
      setReservedContentHeight(0);
      return;
    }

    const currentHeight = measureCurrentContentHeight();
    if (currentHeight > 0) {
      setReservedContentHeight(currentHeight);
    }

    preserveScrollPosition();
    clearVisibleNews();
    setIsLoadingView(true);

    try {
      const data = await getThemeNews(selectedTheme, selectedCategory, 1, PAGE_SIZE);

      if (requestId !== filterRequestSeqRef.current) return;

      const nextView: CachedViewState = {
        articles: data.articles,
        summary: data.summary,
        page: 1,
        hasMore: data.has_more,
        totalArticles: data.total_articles,
        generatedAt: data.generated_at ?? null,
      };

      viewCacheRef.current[currentViewKey] = nextView;
      applyViewState(nextView);
    } catch (error) {
      if (requestId !== filterRequestSeqRef.current) return;

      console.error(error);
      clearVisibleNews();
      setErrorMessage("새로운 뉴스를 불러오는 중 오류가 발생했습니다.");
    } finally {
      if (requestId === filterRequestSeqRef.current) {
        setIsLoadingView(false);

        requestAnimationFrame(() => {
          setReservedContentHeight(0);
          preserveScrollPosition();
        });
      }
    }
  }, [
    applyViewState,
    clearVisibleNews,
    currentViewKey,
    measureCurrentContentHeight,
    preserveScrollPosition,
    selectedTheme,
    selectedCategory,
  ]);

  const loadMorePage = useCallback(async () => {
    if (isLoadingView || isLoadingMore || !hasMore) return;

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

      if (requestId !== loadMoreRequestSeqRef.current) return;

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
      };
    } catch (error) {
      if (requestId !== loadMoreRequestSeqRef.current) return;
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
    if (!target || !hasMore || isLoadingView) return;

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

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <header className="mb-6 space-y-2">
        <p className="text-sm text-gray-500">{today}</p>
        <h1 className="text-3xl font-bold text-gray-900">오늘의 주식 테마 뉴스</h1>
        <p className="text-gray-600">
          원하는 테마를 선택하면 관련 뉴스 요약을 보여줍니다.
        </p>
      </header>

      <div className="mb-6 space-y-4">
        <ThemeSelector
          themes={themes}
          selectedTheme={selectedTheme}
          onSelectTheme={(theme) => {
            if (theme === selectedTheme) return;
            setSelectedTheme(theme);
          }}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => {
            if (category === selectedCategory) return;
            setSelectedCategory(category);
          }}
        />
      </div>

      <div ref={contentAreaRef}>
        {isLoadingView ? (
          <div
            aria-hidden="true"
            className="pointer-events-none invisible"
            style={{
              minHeight: reservedContentHeight > 0 ? `${reservedContentHeight}px` : "280px",
            }}
          />
        ) : errorMessage && articles.length === 0 ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {errorMessage}
          </div>
        ) : (
          <>
            <div className="mb-3">
              <SummaryBox
                theme={selectedTheme}
                category={selectedCategory}
                summary={summary}
                generatedAt={generatedAt}
              />
            </div>

            <NewsList
              articles={articles}
              selectedTheme={selectedTheme}
              selectedCategory={selectedCategory}
              totalArticles={totalArticles}
            />

            <div ref={observerRef} className="py-8 text-center text-sm text-gray-500">
              {isLoadingMore
                ? "추가 뉴스를 불러오는 중입니다..."
                : hasMore
                ? "스크롤하면 다음 뉴스를 불러옵니다."
                : "오늘 날짜 기준으로 더 불러올 뉴스가 없습니다."}
            </div>
          </>
        )}
      </div>

      {isLoadingView && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-2xl border border-gray-200 bg-white/95 px-6 py-4 text-center shadow-xl backdrop-blur-sm">
            <p className="text-xl font-semibold text-gray-800">
              새로운 뉴스를 불러오는 중입니다...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}