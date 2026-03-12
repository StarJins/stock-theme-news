import { Theme } from "@/types/news";

type ThemeSelectorProps = {
  themes: Theme[];
  selectedTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
};

export default function ThemeSelector({
  themes,
  selectedTheme,
  onSelectTheme,
}: ThemeSelectorProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold">테마 선택</h2>

      <div className="flex flex-wrap gap-3">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme;

          return (
            <button
              key={theme}
              type="button"
              onClick={() => onSelectTheme(theme)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
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