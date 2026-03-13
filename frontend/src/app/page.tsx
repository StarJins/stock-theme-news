"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import NewsList from "@/components/NewsList";
import SummaryBox from "@/components/SummaryBox";
import ThemeSelector from "@/components/ThemeSelector";
import { Category, Theme, ThemeNewsResponse } from "@/types/news";

const themes: Theme[] = ["반도체", "AI", "방산"];
const categories: Category[] = ["전체", "경제", "사회", "정치"];

export default function HomePage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("반도체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");

  const [newsData, setNewsData] = useState<ThemeNewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/themes/${encodeURIComponent(
            selectedTheme
          )}/news?category=${encodeURIComponent(selectedCategory)}`
        );

        if (!response.ok) {
          throw new Error("뉴스 데이터를 불러오지 못했습니다.");
        }

        const data: ThemeNewsResponse = await response.json();
        setNewsData(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("뉴스 데이터를 불러오는 중 오류가 발생했습니다.");
        setNewsData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [selectedTheme, selectedCategory]);

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
        ) : newsData ? (
          <>
            <SummaryBox
              theme={selectedTheme}
              category={selectedCategory}
              summary={newsData.summary}
            />

            <NewsList
              articles={newsData.articles}
              selectedTheme={selectedTheme}
              selectedCategory={selectedCategory}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}