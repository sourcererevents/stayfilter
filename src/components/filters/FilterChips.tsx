"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/stores/filterStore";
import { FILTER_GROUPS, AIRBNB_CATEGORIES } from "@/data/filters";

function getFilterLabel(filterId: string): string | null {
  for (const group of FILTER_GROUPS) {
    for (const category of group.categories) {
      const found = category.filters.find((f) => f.id === filterId);
      if (found) return found.label;
    }
  }
  return null;
}

export function FilterChips() {
  const selectedFilters = useFilterStore((s) => s.selectedFilters);
  const toggleFilter = useFilterStore((s) => s.toggleFilter);
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);
  const clearAllFilters = useFilterStore((s) => s.clearAllFilters);
  const roomType = useFilterStore((s) => s.roomType);
  const setRoomType = useFilterStore((s) => s.setRoomType);
  const minBedrooms = useFilterStore((s) => s.minBedrooms);
  const minBeds = useFilterStore((s) => s.minBeds);
  const minBathrooms = useFilterStore((s) => s.minBathrooms);
  const setMinBedrooms = useFilterStore((s) => s.setMinBedrooms);
  const setMinBeds = useFilterStore((s) => s.setMinBeds);
  const setMinBathrooms = useFilterStore((s) => s.setMinBathrooms);
  const priceRange = useFilterStore((s) => s.priceRange);
  const setPriceRange = useFilterStore((s) => s.setPriceRange);

  const chips: { id: string; label: string; onRemove: () => void }[] = [];

  // Price range chip
  if (priceRange.min !== null || priceRange.max !== null) {
    const label =
      priceRange.min !== null && priceRange.max !== null
        ? `$${priceRange.min}–$${priceRange.max}/night`
        : priceRange.min !== null
          ? `$${priceRange.min}+ /night`
          : `Up to $${priceRange.max}/night`;
    chips.push({
      id: "price",
      label,
      onRemove: () => setPriceRange({ min: null, max: null }),
    });
  }

  // Room type chip
  if (roomType) {
    const labels: Record<string, string> = {
      rt_entire: "Entire Place",
      rt_private: "Private Room",
      rt_shared: "Shared Room",
      rt_hotel: "Hotel Room",
    };
    chips.push({
      id: "roomType",
      label: labels[roomType] || roomType,
      onRemove: () => setRoomType(null),
    });
  }

  // Room count chips
  if (minBedrooms > 0) {
    chips.push({
      id: "bedrooms",
      label: `${minBedrooms}+ Bedrooms`,
      onRemove: () => setMinBedrooms(0),
    });
  }
  if (minBeds > 0) {
    chips.push({
      id: "beds",
      label: `${minBeds}+ Beds`,
      onRemove: () => setMinBeds(0),
    });
  }
  if (minBathrooms > 0) {
    chips.push({
      id: "baths",
      label: `${minBathrooms}+ Bathrooms`,
      onRemove: () => setMinBathrooms(0),
    });
  }

  // Category chips (multi-select)
  selectedCategories.forEach((catId) => {
    const cat = AIRBNB_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      chips.push({
        id: `category_${catId}`,
        label: `${cat.icon} ${cat.label}`,
        onRemove: () => toggleCategory(catId),
      });
    }
  });

  // Filter chips
  selectedFilters.forEach((filterId) => {
    const label = getFilterLabel(filterId);
    if (label) {
      chips.push({
        id: filterId,
        label,
        onRemove: () => toggleFilter(filterId),
      });
    }
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-zinc-400 font-medium mr-1">Active:</span>
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          variant="secondary"
          className="bg-zinc-100 text-zinc-700 border border-zinc-200 pl-2.5 pr-1.5 py-1 text-xs font-medium gap-1 hover:bg-zinc-200 transition-colors"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-0.5 hover:text-zinc-900 rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      {chips.length > 2 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-7 px-2"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
