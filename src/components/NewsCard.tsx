import { NewsItem } from "@/types/news";

type NewsCardProps = {
  article: NewsItem;
};

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <span>{article.source}</span>
        <span>•</span>
        <span>{article.publishedAt}</span>
        <span>•</span>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
          {article.category}
        </span>
      </div>

      <h3 className="mb-3 text-lg font-semibold leading-7 text-black">
        {article.title}
      </h3>

      <p className="mb-4 text-sm leading-6 text-gray-700">{article.summary}</p>

      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black transition hover:bg-gray-100"
      >
        원문 보기
      </a>
    </article>
  );
}