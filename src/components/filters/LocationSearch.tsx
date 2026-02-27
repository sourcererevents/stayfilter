"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFilterStore } from "@/stores/filterStore";
import {
  useLocationSearch,
  type LocationSuggestion,
} from "@/hooks/useLocationSearch";

const TYPE_ICONS: Record<string, string> = {
  city: "🏙️",
  town: "🏘️",
  village: "🏡",
  island: "🏝️",
  state: "📍",
  country: "🌍",
  administrative: "📍",
  suburb: "📍",
  county: "📍",
  lake: "🌊",
  river: "🌊",
  water: "🌊",
  peak: "⛰️",
  mountain: "⛰️",
  volcano: "🌋",
  beach: "🏖️",
  bay: "🏖️",
  forest: "🌲",
  park: "🌳",
  national_park: "🏞️",
  nature_reserve: "🌿",
  desert: "🏜️",
  glacier: "🧊",
  cape: "🏖️",
  peninsula: "🏖️",
  valley: "🏔️",
  cliff: "🧗",
  reservoir: "🌊",
  hamlet: "🏘️",
};

export function LocationSearch() {
  const location = useFilterStore((s) => s.location);
  const setLocation = useFilterStore((s) => s.setLocation);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(location.query);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search whenever user is typing (focus is set on input change too)
  const [isTyping, setIsTyping] = useState(false);
  const { suggestions, isLoading, clearSuggestions } = useLocationSearch(
    inputValue,
    isTyping,
  );

  // Sync external store changes to input
  useEffect(() => {
    if (!isFocused) {
      setInputValue(location.query);
    }
  }, [location.query, isFocused]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        setIsTyping(false);
        clearSuggestions();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearSuggestions]);

  function handleSelect(suggestion: LocationSuggestion) {
    setInputValue(suggestion.shortName);
    setLocation({
      query: suggestion.shortName,
      placeId: suggestion.placeId,
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });
    setIsFocused(false);
    setIsTyping(false);
    clearSuggestions();
    inputRef.current?.blur();
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    setIsTyping(true);
    setIsFocused(true); // Ensure dropdown can show
    // Also update the store in real-time so URL builder stays in sync
    setLocation({ query: value });
  }

  const showDropdown = isFocused && (suggestions.length > 0 || isLoading);

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin z-10" />
      )}
      <Input
        ref={inputRef}
        placeholder="Where are you going?"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="pl-10 h-11 bg-zinc-50 border-zinc-200 rounded-xl text-sm focus:bg-white transition-colors"
        autoComplete="off"
      />

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-zinc-200 shadow-xl shadow-zinc-200/50 z-50 overflow-hidden">
          {isLoading && suggestions.length === 0 ? (
            <div className="px-4 py-3 flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Searching...
            </div>
          ) : (
            <ul className="py-1">
              {suggestions.map((suggestion) => (
                <li key={suggestion.placeId}>
                  <button
                    type="button"
                    onClick={() => handleSelect(suggestion)}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 transition-colors group"
                  >
                    <span className="flex-shrink-0 w-8 h-8 bg-zinc-100 group-hover:bg-zinc-200 rounded-lg flex items-center justify-center text-sm transition-colors">
                      {TYPE_ICONS[suggestion.type] || (
                        <Navigation className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {suggestion.shortName}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {suggestion.displayName}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
