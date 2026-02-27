"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface LocationSuggestion {
  placeId: string;
  displayName: string;
  shortName: string;
  type: string;
  lat: string;
  lon: string;
}

export function useLocationSearch(query: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (q: string) => {
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      if (!q || q.length < 2 || !enabled) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          q,
          format: "json",
          addressdetails: "1",
          limit: "6",
          "accept-language": "en",
          dedupe: "1",
        });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            signal: controller.signal,
            headers: {
              "User-Agent": "StayFilter/1.0 (personal-use)",
            },
          },
        );

        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();

        // Accept all results — lakes, mountains, parks, cities, etc. are all
        // valid destinations for accommodation search.
        // Only filter out very granular results like individual buildings or addresses.
        const EXCLUDED_TYPES = new Set([
          "house", "building", "apartments", "residential",
          "retail", "commercial", "industrial", "construction",
          "yes", // generic building tag
        ]);

        const results: LocationSuggestion[] = data
          .filter((item: Record<string, unknown>) => {
            const type = item.type as string;
            return !EXCLUDED_TYPES.has(type);
          })
          .map(
            (item: {
              place_id: number;
              display_name: string;
              type: string;
              lat: string;
              lon: string;
              address?: {
                city?: string;
                town?: string;
                village?: string;
                county?: string;
                state?: string;
                country?: string;
              };
            }) => {
              // Build a clean short name
              const addr = item.address || {};
              const parts: string[] = [];
              const place =
                addr.city || addr.town || addr.village || addr.county;
              if (place) parts.push(place);
              if (addr.state) parts.push(addr.state);
              if (addr.country) parts.push(addr.country);
              const shortName =
                parts.length > 0 ? parts.join(", ") : item.display_name.split(",").slice(0, 2).join(",").trim();

              return {
                placeId: String(item.place_id),
                displayName: item.display_name,
                shortName,
                type: item.type,
                lat: item.lat,
                lon: item.lon,
              };
            },
          );

        setSuggestions(results);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Request was cancelled, ignore
          return;
        }
        console.error("Location search error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return { suggestions, isLoading, clearSuggestions };
}
