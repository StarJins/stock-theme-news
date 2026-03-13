"use client";

import { useMemo, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import NewsList from "@/components/NewsList";
import SummaryBox from "@/components/SummaryBox";
import ThemeSelector from "@/components/ThemeSelector";
import { Category, Theme } from "@/types/news";
import { mockArticles, themeSummaries } from "@/data/mockNews";

const themes: Theme[] = ["반도체", "AI", "방산"];
const categories: Category[] = ["전체", "경제", "사회", "정치"];

export default function HomePage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("반도체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const filteredArticles = useMemo(() => {
    return mockArticles.filter((article) => {
      const matchesTheme = article.theme === selectedTheme;
      const matchesCategory =
        selectedCategory === "전체" || article.category === selectedCategory;

      return matchesTheme && matchesCategory;
    });
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

        <SummaryBox
          theme={selectedTheme}
          category={selectedCategory}
          summary={themeSummaries[selectedTheme]}
        />

        <NewsList
          articles={filteredArticles}
          selectedTheme={selectedTheme}
          selectedCategory={selectedCategory}
        />
      </div>
    </main>
  );
}