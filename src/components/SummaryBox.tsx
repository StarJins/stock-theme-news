import { Category, Theme } from "@/types/news";

type SummaryBoxProps = {
  theme: Theme;
  category: Category;
  summary: string;
  generatedAt?: string | null;
};

export default function SummaryBox({ summary }: SummaryBoxProps) {
  const displaySummary =
    summary.trim() || "오늘 수집된 기사 요약이 아직 없습니다.";

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-3xl font-bold text-gray-950">오늘의 한줄 요약</h2>

      <p className="mt-5 whitespace-pre-line text-lg leading-9 text-gray-800">
        {displaySummary}
      </p>
    </section>
  );
}