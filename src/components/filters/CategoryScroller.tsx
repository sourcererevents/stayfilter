"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIRBNB_CATEGORIES } from "@/data/filters";
import { useFilterStore } from "@/stores/filterStore";

export function CategoryScroller() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedCategory = useFilterStore((s) => s.selectedCategory);
  const setSelectedCategory = useFilterStore((s) => s.setSelectedCategory);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      {/* Left scroll button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md border-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {AIRBNB_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(isSelected ? null : cat.id)
              }
              className={`
                flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-medium transition-all
                ${
                  isSelected
                    ? "bg-zinc-900 text-white shadow-lg scale-[1.02]"
                    : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200"
                }
              `}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md border-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
}
