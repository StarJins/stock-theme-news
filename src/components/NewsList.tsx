import { NewsItem } from "@/types/news";
import NewsCard from "./NewsCard";

type NewsListProps = {
  articles: NewsItem[];
};

export default function NewsList({ articles }: NewsListProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">뉴스 리스트</h2>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          표시할 뉴스가 없습니다.
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