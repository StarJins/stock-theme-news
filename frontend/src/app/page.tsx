"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import NewsList from "@/components/NewsList";
import SummaryBox from "@/components/SummaryBox";
import ThemeSelector from "@/components/ThemeSelector";
import { getThemeNews } from "@/lib/api";
import { Category, NewsItem, Theme } from "@/types/news";

const themes: Theme[] = ["반도체", "AI", "방산"];
const categories: Category[] = ["전체", "경제", "사회", "정치"];
const PAGE_SIZE = 10;

export default function HomePage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("반도체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");

  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [summary, setSummary] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const observerRef = useRef<HTMLDivElement | null>(null);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const resetAndLoadFirstPage = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setPage(1);

      const data = await getThemeNews(
        selectedTheme,
        selectedCategory,
        1,
        PAGE_SIZE
      );

      setArticles(data.articles);
      setSummary(data.summary);
      setHasMore(data.has_more);
      setTotalArticles(data.total_articles);
      setGeneratedAt(data.generated_at ?? null);
    } catch (error) {
      console.error(error);
      setErrorMessage("뉴스 데이터를 불러오는 중 오류가 발생했습니다.");
      setArticles([]);
      setSummary("");
      setHasMore(false);
      setTotalArticles(0);
      setGeneratedAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTheme, selectedCategory]);

  const loadMorePage = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);

      const nextPage = page + 1;
      const data = await getThemeNews(
        selectedTheme,
        selectedCategory,
        nextPage,
        PAGE_SIZE
      );

      setArticles((prev) => [...prev, ...data.articles]);
      setPage(nextPage);
      setHasMore(data.has_more);
      setTotalArticles(data.total_articles);
      setGeneratedAt(data.generated_at ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    hasMore,
    isLoading,
    isLoadingMore,
    page,
    selectedTheme,
    selectedCategory,
  ]);

  useEffect(() => {
    resetAndLoadFirstPage();
  }, [resetAndLoadFirstPage]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;
    if (!hasMore) return;

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
  }, [loadMorePage, hasMore]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="mb-2 text-sm text-gray-500">{today}</p>
          <h1 className="mb-3 text-3xl font-bold">오늘의 주식 테마 뉴스</h1>
          <p className="text-gray-600">
            원하는 테마를 선택하면 관련 뉴스 요약을 보여줍니다.
          </p>
        </header>

        <ThemeSelector
          themes={themes}
          selectedTheme={selectedTheme}
          onSelectTheme={setSelectedTheme}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {isLoading ? (
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-base font-medium text-gray-700">
              뉴스를 불러오는 중입니다...
            </p>
          </section>
        ) : errorMessage ? (
          <section className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="text-base font-medium text-red-700">{errorMessage}</p>
          </section>
        ) : (
          <>
            <SummaryBox
              theme={selectedTheme}
              category={selectedCategory}
              summary={summary}
              generatedAt={generatedAt}
            />

            <NewsList
              articles={articles}
              selectedTheme={selectedTheme}
              selectedCategory={selectedCategory}
              totalArticles={totalArticles}
            />

            <div
              ref={observerRef}
              className="py-6 text-center text-sm text-gray-500"
            >
              {isLoadingMore
                ? "추가 뉴스를 불러오는 중입니다..."
                : hasMore
                ? "스크롤하면 다음 뉴스를 불러옵니다."
                : "오늘 날짜 기준으로 더 불러올 뉴스가 없습니다."}
            </div>

            {hasMore && !isLoadingMore && (
              <div className="pb-8 text-center">
                <button
                  type="button"
                  onClick={loadMorePage}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  더 보기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
