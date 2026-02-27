import { useCallback, useRef } from "react";
import { useSearchStore } from "@/stores/searchStore";
import { useUrlBuilder } from "./useUrlBuilder";
import type { SearchResult } from "@/types/listing";

const MIN_SEARCH_INTERVAL_MS = 2000; // Rate-limit self to avoid hammering Airbnb

export function useSearch() {
  const { buildAirbnbUrl } = useUrlBuilder();
  const store = useSearchStore();
  const lastSearchTime = useRef(0);

  const search = useCallback(async () => {
    // Cooldown check
    const now = Date.now();
    if (now - lastSearchTime.current < MIN_SEARCH_INTERVAL_MS) {
      console.log("[useSearch] Cooldown active, skipping");
      return;
    }
    lastSearchTime.current = now;

    store.setLoading();

    try {
      const airbnbUrl = buildAirbnbUrl();
      console.log("[useSearch] Searching:", airbnbUrl);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: airbnbUrl }),
      });

      if (!response.ok) {
        store.setError(`API returned ${response.status}`);
        return;
      }

      const result: SearchResult = await response.json();

      switch (result.status) {
        case "success":
          store.setResults(result.listings, result.cursor, result.totalCount, {
            airbnb: result.listings.length,
            vrbo: 0, // VRBO inline not yet available — infrastructure ready
          });
          break;
        case "blocked":
          store.setBlocked(result.error || "Blocked by anti-bot protection");
          break;
        case "error":
          store.setError(result.error || "Unknown error parsing results");
          break;
      }
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Network error");
    }
  }, [buildAirbnbUrl, store]);

  const loadMore = useCallback(async () => {
    if (!store.cursor) return;

    // Airbnb uses items_offset for pagination, encoded in the cursor as base64 JSON
    // Cursor format: {"section_offset":0,"items_offset":18,"version":1}
    let itemsOffset = 18;
    try {
      const decoded = JSON.parse(atob(store.cursor));
      if (decoded.items_offset) itemsOffset = decoded.items_offset;
    } catch {
      // Fallback: use cursor as-is
    }

    const airbnbUrl = buildAirbnbUrl();
    const paginatedUrl = airbnbUrl.includes("?")
      ? `${airbnbUrl}&items_offset=${itemsOffset}`
      : `${airbnbUrl}?items_offset=${itemsOffset}`;

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: paginatedUrl }),
      });

      if (!response.ok) return;

      const result: SearchResult = await response.json();
      if (result.status === "success" && result.listings.length > 0) {
        store.appendResults(result.listings, result.cursor);
      }
    } catch {
      // Silently fail on pagination errors
    }
  }, [buildAirbnbUrl, store]);

  return {
    search,
    loadMore,
    listings: store.listings,
    status: store.status,
    hasSearched: store.hasSearched,
    error: store.error,
    cursor: store.cursor,
    totalCount: store.totalCount,
    hoveredListingId: store.hoveredListingId,
    selectedListingId: store.selectedListingId,
    setHoveredListing: store.setHoveredListing,
    setSelectedListing: store.setSelectedListing,
    reset: store.reset,
  };
}
