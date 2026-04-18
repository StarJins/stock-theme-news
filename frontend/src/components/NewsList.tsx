import { NewsItem } from "@/types/news";
import NewsCard from "./NewsCard";

type NewsListProps = {
  articles: NewsItem[];
  selectedTheme: string;
  selectedCategory: string;
  totalArticles?: number;
};

export default function NewsList({
  articles,
  selectedTheme,
  selectedCategory,
  totalArticles,
}: NewsListProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <h2 className="text-xl font-semibold text-gray-900">뉴스 리스트</h2>
        <p className="text-sm text-gray-600">
          {selectedTheme} 테마 / {selectedCategory} 기준 결과 · 현재 {articles.length}건
          표시 / 전체 {totalArticles ?? articles.length}건
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-base font-medium text-gray-700">검색 결과가 없습니다.</p>
          <p className="mt-1 text-sm text-gray-500">
            다른 카테고리를 선택하거나 테마를 변경해보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <NewsCard key={`${article.url}-${article.id}`} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}