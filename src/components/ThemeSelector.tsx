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
  return (
    <section>
      <h2
        className={
          compact
            ? "mb-3 text-xl font-bold text-gray-950"
            : "mb-4 text-3xl font-bold text-gray-950"
        }
      >
        테마 선택
      </h2>

      <div className="flex flex-wrap gap-3">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme;

          return (
            <button
              key={theme}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectTheme(theme)}
              className={`rounded-2xl border font-semibold transition ${
                compact ? "px-4 py-2.5 text-base" : "px-5 py-3 text-lg"
              } ${
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