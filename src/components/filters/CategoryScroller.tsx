"use client";

import { AIRBNB_CATEGORIES } from "@/data/filters";
import { useFilterStore } from "@/stores/filterStore";

export function CategoryScroller() {
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {AIRBNB_CATEGORIES.map((cat) => {
        const isSelected = selectedCategories.has(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-[72px]
              ${
                isSelected
                  ? "bg-zinc-900 text-white shadow-lg scale-[1.02]"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200"
              }
            `}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span className="whitespace-nowrap text-[11px]">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
