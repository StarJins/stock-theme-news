import { Category } from "@/types/news";

type CategoryFilterProps = {
  categories: Category[];
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  compact?: boolean;
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  compact = false,
}: CategoryFilterProps) {
  if (compact) {
    return (
      <section className="shrink-0">
        <div className="flex items-center gap-2 whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
          <span className="shrink-0 text-sm font-bold text-gray-900">
            카테고리
          </span>

          <div className="flex flex-nowrap items-center gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectCategory(category)}
                  className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {category}
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
      <h2 className="mb-4 text-3xl font-bold text-gray-950">카테고리 필터</h2>

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectCategory(category)}
              className={`rounded-2xl border px-5 py-3 text-lg font-semibold transition ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-black hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
}