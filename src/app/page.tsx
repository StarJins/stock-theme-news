const themes = ["반도체", "AI", "방산"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">오늘의 주식 테마 뉴스</h1>
        <p className="text-gray-600 mb-8">
          원하는 테마를 선택하면 관련 뉴스 요약을 보여줍니다.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-4">테마 선택</h2>

          <div className="flex gap-3">
            {themes.map((theme) => (
              <button
                key={theme}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                {theme}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}