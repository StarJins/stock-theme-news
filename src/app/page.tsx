"use client";

import { useMemo, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import NewsList from "@/components/NewsList";
import SummaryBox from "@/components/SummaryBox";
import ThemeSelector from "@/components/ThemeSelector";
import { Category, NewsItem, Theme } from "@/types/news";

const themes: Theme[] = ["반도체", "AI", "방산"];
const categories: Category[] = ["전체", "경제", "사회", "정치"];

const themeSummaries: Record<Theme, string> = {
  반도체:
    "오늘 반도체 테마는 정책 지원과 AI 수요 확대 이슈가 중심입니다.",
  AI: "오늘 AI 테마는 투자 확대와 규제 논의가 함께 부각되고 있습니다.",
  방산: "오늘 방산 테마는 수출 기대와 국방 예산 이슈가 핵심입니다.",
};

const mockArticles: NewsItem[] = [
  {
    id: 1,
    theme: "반도체",
    title: "정부, 반도체 산업 지원책 검토",
    source: "연합뉴스",
    publishedAt: "2026-03-12 09:30",
    category: "정치",
    summary:
      "정부가 반도체 산업 경쟁력 강화를 위한 지원 정책을 검토하고 있다는 내용입니다.",
    url: "https://example.com/1",
  },
  {
    id: 2,
    theme: "반도체",
    title: "AI 서버 수요 확대에 HBM 기대감",
    source: "한국경제",
    publishedAt: "2026-03-12 11:10",
    category: "경제",
    summary:
      "AI 인프라 확대와 함께 고대역폭 메모리 수요 증가 가능성이 주목받고 있습니다.",
    url: "https://example.com/2",
  },
  {
    id: 3,
    theme: "반도체",
    title: "첨단 공정 인력 확보 경쟁 심화",
    source: "매일경제",
    publishedAt: "2026-03-12 13:20",
    category: "사회",
    summary:
      "반도체 업계 전반에서 고급 인재 확보 경쟁이 이어지고 있다는 보도입니다.",
    url: "https://example.com/3",
  },
];

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

        <SummaryBox summary={themeSummaries[selectedTheme]} />

        <NewsList articles={filteredArticles} />
      </div>
    </main>
  );
}