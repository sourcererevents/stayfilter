"use client";

import { useState } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FILTER_GROUPS, TOTAL_FILTER_COUNT } from "@/data/filters";
import { FilterSection } from "./FilterSection";
import { RoomCounts } from "./RoomCounts";
import { useFilterStore } from "@/stores/filterStore";
import { useUrlBuilder } from "@/hooks/useUrlBuilder";
import type { FilterOption } from "@/types/filters";

export function FilterSheet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const activeCount = useFilterStore((s) => s.getActiveFilterCount());
  const clearAllFilters = useFilterStore((s) => s.clearAllFilters);
  const selectedFilters = useFilterStore((s) => s.selectedFilters);
  const toggleFilter = useFilterStore((s) => s.toggleFilter);
  const { buildAirbnbUrl, buildVrboUrl } = useUrlBuilder();

  // Search through all filters
  const searchResults: { filter: FilterOption; groupLabel: string }[] = [];
  if (searchQuery.length >= 2) {
    const q = searchQuery.toLowerCase();
    for (const group of FILTER_GROUPS) {
      for (const category of group.categories) {
        for (const filter of category.filters) {
          if (filter.label.toLowerCase().includes(q)) {
            searchResults.push({ filter, groupLabel: group.label });
          }
        }
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-xl border-zinc-200 bg-zinc-50 hover:bg-white gap-2 text-sm font-medium transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          All Filters
          {activeCount > 0 && (
            <Badge className="bg-rose-500 text-white text-[10px] h-5 px-1.5 ml-1">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] sm:max-w-[540px] p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-zinc-100 space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">
              All Filters
              <span className="text-zinc-400 font-normal text-sm ml-2">
                {TOTAL_FILTER_COUNT} available
              </span>
            </SheetTitle>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Search within filters */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search filters... (e.g. sauna, pool, cabin)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-zinc-50 border-zinc-200 rounded-lg text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
              </button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            {/* Search results mode */}
            {searchQuery.length >= 2 ? (
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 mb-3">
                  {searchResults.length} filter{searchResults.length !== 1 ? "s" : ""} found
                </p>
                {searchResults.map(({ filter, groupLabel }) => {
                  const isSelected = selectedFilters.has(filter.id);
                  return (
                    <label
                      key={filter.id}
                      className={`
                        flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer transition-colors
                        ${isSelected ? "bg-rose-50" : "hover:bg-zinc-50"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilter(filter.id)}
                          className="w-4 h-4 rounded border-zinc-300 text-rose-500 focus:ring-rose-500"
                        />
                        <span className={`text-sm ${isSelected ? "font-medium text-zinc-900" : "text-zinc-700"}`}>
                          {filter.label}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">{groupLabel}</span>
                    </label>
                  );
                })}
                {searchResults.length === 0 && (
                  <p className="text-sm text-zinc-400 text-center py-8">
                    No filters match &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              /* Normal browsing mode */
              <>
                {/* Room counts */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-zinc-800 mb-4">
                    Rooms & Beds
                  </h3>
                  <RoomCounts />
                </div>

                <Separator className="my-4" />

                {/* All filter categories */}
                <Accordion type="multiple" className="space-y-0">
                  {FILTER_GROUPS.map((group) =>
                    group.categories.map((category) => (
                      <FilterSection
                        key={category.id}
                        category={category}
                        groupLabel={group.label}
                      />
                    )),
                  )}
                </Accordion>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-zinc-100 bg-white gap-2">
          <Button
            onClick={() => {
              window.open(buildAirbnbUrl(), "_blank");
            }}
            className="flex-1 h-11 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/20"
          >
            Search Airbnb
          </Button>
          <Button
            onClick={() => {
              window.open(buildVrboUrl(), "_blank");
            }}
            variant="outline"
            className="flex-1 h-11 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl font-semibold"
          >
            Search VRBO
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
