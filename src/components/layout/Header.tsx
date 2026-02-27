"use client";

import { Compass } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 leading-tight">
              StayFilter
            </h1>
            <p className="text-[10px] text-zinc-400 -mt-0.5 tracking-wide uppercase">
              Deep Search · Airbnb + VRBO
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            Phase 1 — URL Builder
          </span>
        </div>
      </div>
    </header>
  );
}
