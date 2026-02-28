"use client";

import { Compass, Heart } from "lucide-react";
import { DONATE_URL } from "./DonatePopup";

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

        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-400 hover:text-rose-500 transition-colors"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Support</span>
        </a>
      </div>
    </header>
  );
}
