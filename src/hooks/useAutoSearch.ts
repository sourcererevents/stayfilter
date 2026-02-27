import { useEffect, useRef } from "react";
import { useFilterStore } from "@/stores/filterStore";
import { useSearch } from "./useSearch";
import { useSearchStore } from "@/stores/searchStore";

/**
 * Auto-triggers search when filters change, with debouncing.
 * Only fires after the user has already searched at least once
 * (i.e., after NLP parse or manual search) to avoid searching on page load.
 */
export function useAutoSearch(debounceMs = 600) {
  const { search } = useSearch();
  const hasSearched = useSearchStore((s) => s.hasSearched);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Store search in a ref so the effect doesn't depend on it.
  // `search` from useSearch() is unstable because it depends on the whole
  // search store — every setResults() call gives it a new identity, which
  // would re-trigger this effect and cause an infinite search loop.
  const searchRef = useRef(search);
  searchRef.current = search;

  // Subscribe to the filter store — create a fingerprint of all filter state
  const location = useFilterStore((s) => s.location.query);
  const checkin = useFilterStore((s) => s.dates.checkin);
  const checkout = useFilterStore((s) => s.dates.checkout);
  const adults = useFilterStore((s) => s.guests.adults);
  const children = useFilterStore((s) => s.guests.children);
  const infants = useFilterStore((s) => s.guests.infants);
  const pets = useFilterStore((s) => s.guests.pets);
  const priceMin = useFilterStore((s) => s.priceRange.min);
  const priceMax = useFilterStore((s) => s.priceRange.max);
  const selectedFilters = useFilterStore((s) => s.selectedFilters);
  const roomType = useFilterStore((s) => s.roomType);
  const minBedrooms = useFilterStore((s) => s.minBedrooms);
  const minBeds = useFilterStore((s) => s.minBeds);
  const minBathrooms = useFilterStore((s) => s.minBathrooms);
  const selectedCategories = useFilterStore((s) => s.selectedCategories);

  // Build a serialized fingerprint so useEffect detects changes
  const fingerprint = JSON.stringify({
    location,
    checkin,
    checkout,
    adults,
    children,
    infants,
    pets,
    priceMin,
    priceMax,
    filters: [...selectedFilters].sort(),
    roomType,
    minBedrooms,
    minBeds,
    minBathrooms,
    categories: [...selectedCategories].sort(),
  });

  useEffect(() => {
    // Skip the initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only auto-search if user has already searched at least once
    // and there's a location set (can't search without destination)
    if (!hasSearched || !location) return;

    // Debounce the search
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      searchRef.current();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // NOTE: `search` is deliberately excluded — it's accessed via searchRef
    // to prevent the search store's state changes from re-triggering this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint, hasSearched, location, debounceMs]);
}
