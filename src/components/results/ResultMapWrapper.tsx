"use client";

import dynamic from "next/dynamic";

// Leaflet accesses `window` on import — must be loaded client-side only
const ResultMap = dynamic(() => import("./ResultMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-xl">
      <div className="text-center space-y-2 p-8 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center mx-auto">
          <span className="text-xl">🗺️</span>
        </div>
        <p className="text-sm font-medium text-zinc-400">Loading map…</p>
      </div>
    </div>
  ),
});

export function ResultMapWrapper() {
  return <ResultMap />;
}
