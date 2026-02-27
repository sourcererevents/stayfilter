"use client";

import { ExternalLink, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LocationSearch } from "./LocationSearch";
import { DatePicker } from "./DatePicker";
import { GuestSelector } from "./GuestSelector";
import { PriceRange } from "./PriceRange";
import { FilterSheet } from "./FilterSheet";
import { FilterChips } from "./FilterChips";
import { CategoryScroller } from "./CategoryScroller";
import { useUrlBuilder } from "@/hooks/useUrlBuilder";
import { useFilterStore } from "@/stores/filterStore";
import { useSearch } from "@/hooks/useSearch";
import { useSearchStore } from "@/stores/searchStore";

export function FilterBar() {
  const { buildAirbnbUrl, buildVrboUrl } = useUrlBuilder();
  const activeCount = useFilterStore((s) => s.getActiveFilterCount());
  const location = useFilterStore((s) => s.location);
  const { search } = useSearch();
  const searchStatus = useSearchStore((s) => s.status);
  const hasSearched = useSearchStore((s) => s.hasSearched);

  const isSearching = searchStatus === "loading";

  return (
    <div className="space-y-4">
      {/* Primary filters row */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6 space-y-4">
        {/* Top row: Location + Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Destination
            </label>
            <LocationSearch />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Dates
            </label>
            <DatePicker />
          </div>
        </div>

        {/* Second row: Guests + Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Guests
            </label>
            <GuestSelector />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Price per night
            </label>
            <PriceRange />
          </div>
        </div>

        <Separator />

        {/* Search buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Primary: Inline search */}
          <Button
            onClick={search}
            disabled={isSearching}
            className="flex-1 h-12 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-500/20 transition-all hover:shadow-xl hover:shadow-rose-500/30 disabled:opacity-70"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                {hasSearched ? "Update Search" : "Search"}
                {activeCount > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {activeCount} filter{activeCount !== 1 ? "s" : ""}
                  </span>
                )}
              </>
            )}
          </Button>

          {/* Secondary: Open on Airbnb directly */}
          <Button
            onClick={() => window.open(buildAirbnbUrl(), "_blank")}
            variant="outline"
            className="h-12 border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl font-medium text-sm transition-all px-5"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Airbnb
          </Button>

          {/* VRBO stays as external only */}
          <Button
            onClick={() => window.open(buildVrboUrl(), "_blank")}
            variant="outline"
            className="h-12 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl font-medium text-sm transition-all px-5"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            VRBO
          </Button>
        </div>

        {/* Generated URL preview — collapse when results are showing */}
        {location.query && !hasSearched && (
          <div className="space-y-2">
            <div className="bg-zinc-50 rounded-lg p-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Generated Airbnb URL
              </p>
              <p className="text-xs text-zinc-500 font-mono break-all leading-relaxed">
                {buildAirbnbUrl()}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">
                Generated VRBO URL
              </p>
              <p className="text-xs text-blue-500 font-mono break-all leading-relaxed">
                {buildVrboUrl()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active filter chips */}
      <FilterChips />

      {/* All Filters */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2 px-1">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            All Filters
          </h3>
          <p className="text-[11px] text-zinc-400">
            Bedrooms, bathrooms, sauna, pool, EV charger, and 270+ more
          </p>
        </div>
        <FilterSheet />
      </div>

      {/* Category scroller */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
          Airbnb Categories
        </h3>
        <CategoryScroller />
      </div>
    </div>
  );
}
