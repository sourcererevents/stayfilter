"use client";

import { Header } from "@/components/layout/Header";
import { FilterBar } from "@/components/filters/FilterBar";
import { ResultList } from "@/components/results/ResultList";
import { useSearch } from "@/hooks/useSearch";
import { useSearchStore } from "@/stores/searchStore";
import { TOTAL_FILTER_COUNT } from "@/data/filters";
import {
  Sparkles,
  Eye,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { loadMore } = useSearch();
  const hasSearched = useSearchStore((s) => s.hasSearched);
  const status = useSearchStore((s) => s.status);

  const showResults = hasSearched || status === "loading";

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <Header />

      <main className={`mx-auto px-4 sm:px-6 py-6 sm:py-10 ${showResults ? "max-w-[1400px]" : "max-w-[1200px] space-y-8"}`}>
        {/* Hero — only show when no results */}
        {!showResults && (
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              Deep Search.{" "}
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Every Filter.
              </span>
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm sm:text-base">
              Access all {TOTAL_FILTER_COUNT}+ Airbnb filters — including hidden amenities
              that Airbnb doesn&apos;t show in their UI. Search VRBO simultaneously.
            </p>
          </div>
        )}

        {/* Filter bar — always visible */}
        <FilterBar />

        {/* Results or landing content */}
        {showResults ? (
          /* ── Results mode: split pane ── */
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-6">
            {/* Left: Result list */}
            <div className="min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto rounded-xl border border-zinc-200 bg-white">
              <ResultList onLoadMore={loadMore} />
            </div>

            {/* Right: Map placeholder */}
            <div className="hidden lg:flex min-h-[400px] max-h-[calc(100vh-280px)] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-50 items-center justify-center sticky top-6">
              <div className="text-center space-y-2 p-8">
                <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center mx-auto">
                  <span className="text-xl">🗺️</span>
                </div>
                <p className="text-sm font-medium text-zinc-500">Map coming soon</p>
                <p className="text-xs text-zinc-400 max-w-[200px]">
                  Interactive map with price pins will appear here in a future update.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Discovery mode: feature cards + roadmap ── */
          <>
            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-2.5">
                <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center">
                  <Eye className="w-4.5 h-4.5 text-rose-500" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Hidden Filters Unlocked
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Airbnb only shows ~24 amenity filters in their UI. We surface all{" "}
                  {TOTAL_FILTER_COUNT}+ including sauna, bidet, bread maker, record player,
                  kayak, and more.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-2.5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Zap className="w-4.5 h-4.5 text-blue-500" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Cross-Platform Search
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Search Airbnb and VRBO simultaneously with the same filter set.
                  Compare results across platforms without setting up filters twice.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-2.5">
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Inline Results
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  See Airbnb results right inside the app with images, prices,
                  and ratings. Compare on VRBO with one click.
                </p>
              </div>
            </div>

            {/* Roadmap teaser */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-6 sm:p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">What&apos;s Next</h3>
                  <div className="space-y-2">
                    {[
                      { phase: "Phase 2", label: "Inline Airbnb results with source badges", status: "done" },
                      { phase: "Phase 2", label: "VRBO cross-search comparison", status: "done" },
                      { phase: "Phase 3", label: "Interactive map with price pins", status: "up next" },
                      { phase: "Phase 3", label: "Price tracking & alerts", status: "planned" },
                      { phase: "Phase 4", label: "Saved searches with new listing diffs", status: "planned" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
                          {item.phase}
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="text-zinc-300">{item.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          item.status === "done"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : item.status === "up next"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-white/5 text-zinc-500"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
