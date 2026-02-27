import { useCallback, useRef } from "react";
import { useSearchStore } from "@/stores/searchStore";
import { useFilterStore } from "@/stores/filterStore";
import { useUrlBuilder } from "./useUrlBuilder";
import { AIRBNB_CATEGORIES } from "@/data/filters";
import type { Listing, SearchResult } from "@/types/listing";

const MIN_SEARCH_INTERVAL_MS = 2000; // Rate-limit self to avoid hammering Airbnb

/**
 * Post-filter listings by property-type category keywords.
 * Airbnb's `category_tag` param acts as a soft recommendation — it can return
 * non-matching property types. For categories tied to specific property types
 * (Yurts, Cabins, Treehouses, etc.), we enforce strict matching via the
 * Airbnb listing title (formatted as "[PropertyType] in [Location]").
 *
 * Categories without titleKeywords (Amazing Views, Trending, etc.) are
 * subjective/curated and skip this filter.
 */
function filterByCategory(listings: Listing[], selectedCategories: Set<string>): Listing[] {
  if (selectedCategories.size === 0) return listings;

  // Collect title keywords from all selected categories that have them
  const allKeywords: string[] = [];
  selectedCategories.forEach((catId) => {
    const cat = AIRBNB_CATEGORIES.find((c) => c.id === catId);
    if (cat && "titleKeywords" in cat && cat.titleKeywords) {
      allKeywords.push(...(cat.titleKeywords as readonly string[]));
    }
  });

  // If none of the selected categories have title keywords, skip filtering
  if (allKeywords.length === 0) return listings;

  // Keep listings whose title (stored in `city`) starts with any keyword
  // Airbnb titles follow "[PropertyType] in [Location]" format
  return listings.filter((listing) => {
    const title = (listing.city || "").toLowerCase();
    return allKeywords.some((kw) => title.startsWith(kw.toLowerCase()));
  });
}

export function useSearch() {
  const { buildAirbnbUrl } = useUrlBuilder();
  const store = useSearchStore();
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
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
        case "success": {
          // Post-filter by property-type category keywords (Yurts, Cabins, etc.)
          const filtered = filterByCategory(result.listings, selectedCategories);
          store.setResults(filtered, result.cursor, result.totalCount, {
            airbnb: filtered.length,
            vrbo: 0, // VRBO inline not yet available — infrastructure ready
          });
          break;
        }
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
  }, [buildAirbnbUrl, store, selectedCategories]);

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
        const filtered = filterByCategory(result.listings, selectedCategories);
        if (filtered.length > 0) {
          store.appendResults(filtered, result.cursor);
        }
      }
    } catch {
      // Silently fail on pagination errors
    }
  }, [buildAirbnbUrl, store, selectedCategories]);

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
