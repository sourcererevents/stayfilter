"use client";

import { Header } from "@/components/layout/Header";
import { FilterBar } from "@/components/filters/FilterBar";
import { TOTAL_FILTER_COUNT } from "@/data/filters";
import {
  Sparkles,
  Eye,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero section */}
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

        {/* Main filter area */}
        <FilterBar />

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
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Inline Results Coming
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Phase 2 brings live results inside the app — split-pane with cards
              and an interactive map. Price tracking, saved searches, and
              comparison tools.
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
                  { phase: "Phase 2", label: "Inline results with interactive map", status: "up next" },
                  { phase: "Phase 2", label: "Side-by-side Airbnb vs VRBO comparison", status: "planned" },
                  { phase: "Phase 3", label: "Price tracking & alerts", status: "planned" },
                  { phase: "Phase 3", label: "Saved searches with new listing diffs", status: "planned" },
                  { phase: "Phase 3", label: "Travel time isochrones", status: "planned" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
                      {item.phase}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-500" />
                    <span className="text-zinc-300">{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      item.status === "up next"
                        ? "bg-emerald-500/20 text-emerald-400"
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
      </main>
    </div>
  );
}
