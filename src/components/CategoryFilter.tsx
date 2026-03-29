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
  return (
    <section>
      <h2
        className={
          compact
            ? "mb-3 text-xl font-bold text-gray-950"
            : "mb-4 text-3xl font-bold text-gray-950"
        }
      >
        카테고리 필터
      </h2>

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectCategory(category)}
              className={`rounded-2xl border font-semibold transition ${
                compact ? "px-4 py-2.5 text-base" : "px-5 py-3 text-lg"
              } ${
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