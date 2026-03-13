import { NewsItem } from "@/types/news";
import NewsCard from "./NewsCard";

type NewsListProps = {
  articles: NewsItem[];
  selectedTheme: string;
  selectedCategory: string;
};

export default function NewsList({
  articles,
  selectedTheme,
  selectedCategory,
}: NewsListProps) {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">뉴스 리스트</h2>
          <p className="mt-1 text-sm text-gray-500">
            {selectedTheme} 테마 / {selectedCategory} 기준 결과
          </p>
        </div>

        <div className="text-sm font-medium text-gray-600">
          총 {articles.length}건
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="mb-2 text-base font-medium text-gray-700">
            검색 결과가 없습니다.
          </p>
          <p className="text-sm text-gray-500">
            다른 카테고리를 선택하거나 테마를 변경해보세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}