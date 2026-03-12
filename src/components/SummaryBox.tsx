type SummaryBoxProps = {
  summary: string;
};

export default function SummaryBox({ summary }: SummaryBoxProps) {
  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <h2 className="mb-3 text-xl font-semibold">오늘의 한줄 요약</h2>
      <p className="text-sm leading-6 text-gray-700">{summary}</p>
    </section>
  );
}