"use client";

import { Search, AlertCircle, ExternalLink, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultCard } from "./ResultCard";
import { ResultSkeleton } from "./ResultSkeleton";
import { useSearchStore } from "@/stores/searchStore";
import { useUrlBuilder } from "@/hooks/useUrlBuilder";

interface ResultListProps {
  onLoadMore?: () => void;
}

export function ResultList({ onLoadMore }: ResultListProps) {
  const listings = useSearchStore((s) => s.listings);
  const status = useSearchStore((s) => s.status);
  const hasSearched = useSearchStore((s) => s.hasSearched);
  const error = useSearchStore((s) => s.error);
  const cursor = useSearchStore((s) => s.cursor);
  const totalCount = useSearchStore((s) => s.totalCount);
  const sourceBreakdown = useSearchStore((s) => s.sourceBreakdown);
  const hoveredListingId = useSearchStore((s) => s.hoveredListingId);
  const setHoveredListing = useSearchStore((s) => s.setHoveredListing);
  const { buildAirbnbUrl, buildVrboUrl } = useUrlBuilder();

  // ── Idle state: haven't searched yet ──
  if (!hasSearched && status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <Search className="w-5 h-5 text-zinc-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-700 mb-1">
          Ready to search
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs">
          Configure your filters and click Search to see Airbnb listings right here.
        </p>
      </div>
    );
  }

  // ── Loading state ──
  if (status === "loading") {
    return (
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-400">Searching Airbnb...</span>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ── Blocked state ──
  if (status === "blocked") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-700 mb-1">
          Inline results unavailable
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mb-4">
          Airbnb blocked the inline fetch. You can still search directly on their site.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open(buildAirbnbUrl(), "_blank")}
            className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open on Airbnb
          </Button>
          <Button
            onClick={() => window.open(buildVrboUrl(), "_blank")}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open on VRBO
          </Button>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-700 mb-1">
          Something went wrong
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mb-4">
          {error || "Could not load results. Try again or search on Airbnb directly."}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open(buildAirbnbUrl(), "_blank")}
            variant="outline"
            className="rounded-xl text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open on Airbnb
          </Button>
          <Button
            onClick={() => window.open(buildVrboUrl(), "_blank")}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open on VRBO
          </Button>
        </div>
      </div>
    );
  }

  // ── Success: no results ──
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <Search className="w-5 h-5 text-zinc-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-700 mb-1">
          No listings found
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mb-4">
          Try broadening your filters or searching a different area.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open(buildAirbnbUrl(), "_blank")}
            variant="outline"
            className="rounded-xl text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Try on Airbnb
          </Button>
          <Button
            onClick={() => window.open(buildVrboUrl(), "_blank")}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Try on VRBO
          </Button>
        </div>
      </div>
    );
  }

  // ── Build count string ──
  const countStr = totalCount > listings.length
    ? `Showing ${listings.length} of ~${totalCount}+ listings`
    : `${listings.length} listing${listings.length !== 1 ? "s" : ""} found`;

  // Source breakdown only shown when VRBO results are available
  const breakdownStr = sourceBreakdown && sourceBreakdown.vrbo > 0
    ? ` (${sourceBreakdown.airbnb} Airbnb · ${sourceBreakdown.vrbo} VRBO)`
    : "";

  // ── Success / Partial: show results ──
  return (
    <div className="space-y-3 p-4">
      {/* Partial status banner (one source failed) */}
      {status === "partial" && error && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 flex-1">{error}</p>
          <button
            onClick={() => window.open(buildVrboUrl(), "_blank")}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
          >
            Open on VRBO ↗
          </button>
        </div>
      )}

      {/* Result count header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 font-medium">
          {countStr}{breakdownStr}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(buildAirbnbUrl(), "_blank")}
            className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            Airbnb
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.open(buildVrboUrl(), "_blank")}
            className="text-[11px] text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            VRBO
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Listing cards */}
      {listings.map((listing) => (
        <ResultCard
          key={`${listing.source}-${listing.id}`}
          listing={listing}
          isHovered={hoveredListingId === listing.id}
          onMouseEnter={() => setHoveredListing(listing.id)}
          onMouseLeave={() => setHoveredListing(null)}
        />
      ))}

      {/* Load more */}
      {cursor && onLoadMore && (
        <div className="flex justify-center pt-2 pb-4">
          <Button
            onClick={onLoadMore}
            variant="outline"
            className="rounded-xl text-sm"
          >
            Load more results
          </Button>
        </div>
      )}

      {/* VRBO cross-search CTA */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
        <div className="text-sm">🏠</div>
        <div className="flex-1">
          <p className="text-xs font-medium text-blue-800">
            Compare on VRBO
          </p>
          <p className="text-[11px] text-blue-600">
            Same search, different inventory — some properties are VRBO-only.
          </p>
        </div>
        <Button
          onClick={() => window.open(buildVrboUrl(), "_blank")}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg h-7 px-3"
        >
          Search VRBO
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
