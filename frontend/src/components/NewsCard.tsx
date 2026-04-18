import { NewsItem } from "@/types/news";

type NewsCardProps = {
  article: NewsItem;
};

function getBadgeStyle(percent?: number | null) {
  if (percent == null) {
    return "bg-gray-100 text-gray-700";
  }

  if (percent >= 85) {
    return "bg-green-100 text-green-800";
  }

  if (percent >= 70) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (percent >= 50) {
    return "bg-yellow-100 text-yellow-800";
  }

  if (percent >= 30) {
    return "bg-orange-100 text-orange-800";
  }

  return "bg-red-100 text-red-800";
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span>{article.source}</span>
        {article.publishedAt && <span>• {article.publishedAt}</span>}
        <span>• {article.category}</span>

        {typeof article.relevancePercent === "number" && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getBadgeStyle(
              article.relevancePercent
            )}`}
          >
            연관도 {article.relevancePercent}%
            {article.relevanceLabel ? ` · ${article.relevanceLabel}` : ""}
          </span>
        )}
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-7 text-gray-900">
        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          {article.title}
        </a>
      </h3>

      <p className="mb-4 whitespace-pre-line text-sm leading-6 text-gray-700">
        {article.summary}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>테마: {article.theme}</span>

        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >
          원문 보기
        </a>
      </div>
    </article>
  );
}