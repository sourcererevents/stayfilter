"use client";

import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFilterStore } from "@/stores/filterStore";

export function PriceRange() {
  const priceRange = useFilterStore((s) => s.priceRange);
  const setPriceRange = useFilterStore((s) => s.setPriceRange);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          type="number"
          placeholder="Min"
          value={priceRange.min ?? ""}
          onChange={(e) =>
            setPriceRange({
              min: e.target.value ? parseInt(e.target.value, 10) : null,
            })
          }
          className="pl-9 h-11 bg-zinc-50 border-zinc-200 rounded-xl text-sm focus:bg-white transition-colors"
        />
      </div>
      <span className="text-zinc-300 text-sm">—</span>
      <div className="relative flex-1">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          type="number"
          placeholder="Max"
          value={priceRange.max ?? ""}
          onChange={(e) =>
            setPriceRange({
              max: e.target.value ? parseInt(e.target.value, 10) : null,
            })
          }
          className="pl-9 h-11 bg-zinc-50 border-zinc-200 rounded-xl text-sm focus:bg-white transition-colors"
        />
      </div>
    </div>
  );
}
