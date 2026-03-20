type SummaryBoxProps = {
  theme: string;
  category: string;
  summary: string;
  generatedAt?: string | null;
};

function formatGeneratedAt(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SummaryBox({
  theme,
  category,
  summary,
  generatedAt,
}: SummaryBoxProps) {
  const formattedGeneratedAt = formatGeneratedAt(generatedAt);

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
          선택 테마: {theme}
        </span>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          카테고리: {category}
        </span>
        {formattedGeneratedAt && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            최근 수집: {formattedGeneratedAt}
          </span>
        )}
      </div>

      <h2 className="mb-3 text-xl font-semibold">오늘의 한줄 요약</h2>
      <p className="text-sm leading-6 text-gray-700">{summary}</p>
    </section>
  );
}
