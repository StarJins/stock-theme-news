import { Theme } from "@/types/news";

type ThemeSelectorProps = {
  themes: Theme[];
  selectedTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  compact?: boolean;
};

export default function ThemeSelector({
  themes,
  selectedTheme,
  onSelectTheme,
  compact = false,
}: ThemeSelectorProps) {
  if (compact) {
    return (
      <section className="shrink-0">
        <div className="flex items-center gap-2 whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
          <span className="shrink-0 text-sm font-bold text-gray-900">테마</span>

          <div className="flex flex-nowrap items-center gap-2">
            {themes.map((theme) => {
              const isSelected = selectedTheme === theme;

              return (
                <button
                  key={theme}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectTheme(theme)}
                  className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-3xl font-bold text-gray-950">테마 선택</h2>

      <div className="flex flex-wrap gap-3">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme;

          return (
            <button
              key={theme}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectTheme(theme)}
              className={`rounded-2xl border px-5 py-3 text-lg font-semibold transition ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-black hover:bg-gray-100"
              }`}
            >
              {theme}
            </button>
          );
        })}
      </div>
    </section>
  );
}