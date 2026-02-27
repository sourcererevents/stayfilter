"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useFilterStore } from "@/stores/filterStore";
import type { FilterCategory, FilterLogic } from "@/types/filters";

interface FilterSectionProps {
  category: FilterCategory;
  groupLabel: string;
  logic: FilterLogic;
  logicTip?: string;
}

export function FilterSection({
  category,
  groupLabel,
  logic,
  logicTip,
}: FilterSectionProps) {
  const selectedFilters = useFilterStore((s) => s.selectedFilters);
  const toggleFilter = useFilterStore((s) => s.toggleFilter);

  const selectedCount = category.filters.filter((f) =>
    selectedFilters.has(f.id),
  ).length;

  return (
    <AccordionItem value={category.id} className="border-b border-zinc-100">
      <AccordionTrigger className="py-4 hover:no-underline group/trigger">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-800 group-hover/trigger:text-zinc-900">
            {groupLabel}
          </span>
          {selectedCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-rose-50 text-rose-600 border-rose-200 text-[10px] h-5 px-1.5"
            >
              {selectedCount}
            </Badge>
          )}
          {selectedCount > 1 && (
            <span
              title={logicTip}
              className={`
                text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md cursor-help
                ${logic === "or"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
                }
              `}
            >
              {logic === "or" ? "ANY" : "ALL"}
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        {/* Logic tip when multiple are selected */}
        {selectedCount > 1 && logicTip && (
          <p
            className={`text-[11px] mb-3 px-2.5 py-1.5 rounded-lg ${
              logic === "or"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {logic === "or" ? "✓" : "⚠"} {logicTip}
          </p>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {category.filters.map((filter) => {
            const isSelected = selectedFilters.has(filter.id);
            return (
              <label
                key={filter.id}
                className={`
                  flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors text-sm
                  ${isSelected ? "bg-rose-50 text-zinc-900" : "hover:bg-zinc-50 text-zinc-600"}
                `}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleFilter(filter.id)}
                  className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                />
                <span className={isSelected ? "font-medium" : ""}>
                  {filter.label}
                </span>
              </label>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
