import { Category } from "@/types/news";

type CategoryFilterProps = {
  categories: Category[];
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold">카테고리 필터</h2>

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
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