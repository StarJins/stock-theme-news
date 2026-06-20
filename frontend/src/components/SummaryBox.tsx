export default function SummaryBox() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-950">뉴스 정렬 기준</h2>

      <div className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
        <p>
          연관도 기준으로 70% 이상, 50% 이상, 50% 미만 순서로 묶어 보여줍니다.
        </p>

        <p>
          같은 묶음 안에서는 최신 뉴스가 먼저 표시됩니다.
        </p>
      </div>
    </section>
  );
}
