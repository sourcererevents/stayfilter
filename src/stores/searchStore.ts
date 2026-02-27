import { create } from "zustand";
import type { Listing } from "@/types/listing";

type SearchStatus = "idle" | "loading" | "success" | "partial" | "blocked" | "error";

interface SourceBreakdown {
  airbnb: number;
  vrbo: number;
}

interface SearchStore {
  listings: Listing[];
  status: SearchStatus;
  hasSearched: boolean;
  error: string | null;
  cursor: string | null;
  totalCount: number;
  sourceBreakdown: SourceBreakdown | null;

  // Map interaction state
  hoveredListingId: string | null;
  selectedListingId: string | null;

  // Actions
  setLoading: () => void;
  setResults: (listings: Listing[], cursor: string | null, totalCount: number, breakdown?: SourceBreakdown) => void;
  appendResults: (listings: Listing[], cursor: string | null) => void;
  setPartial: (listings: Listing[], error: string, breakdown: SourceBreakdown) => void;
  setBlocked: (error: string) => void;
  setError: (error: string) => void;
  setHoveredListing: (id: string | null) => void;
  setSelectedListing: (id: string | null) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  listings: [],
  status: "idle",
  hasSearched: false,
  error: null,
  cursor: null,
  totalCount: 0,
  sourceBreakdown: null,
  hoveredListingId: null,
  selectedListingId: null,

  setLoading: () => set({ status: "loading", error: null }),

  setResults: (listings, cursor, totalCount, breakdown) =>
    set({
      listings,
      status: "success",
      hasSearched: true,
      error: null,
      cursor,
      totalCount,
      sourceBreakdown: breakdown || null,
    }),

  appendResults: (newListings, cursor) =>
    set((state) => ({
      listings: [...state.listings, ...newListings],
      cursor,
      totalCount: state.totalCount + newListings.length,
    })),

  setPartial: (listings, error, breakdown) =>
    set({
      listings,
      status: "partial",
      hasSearched: true,
      error,
      cursor: null,
      totalCount: listings.length,
      sourceBreakdown: breakdown,
    }),

  setBlocked: (error) =>
    set({ status: "blocked", hasSearched: true, error, listings: [], totalCount: 0, sourceBreakdown: null }),

  setError: (error) =>
    set({ status: "error", hasSearched: true, error }),

  setHoveredListing: (id) => set({ hoveredListingId: id }),
  setSelectedListing: (id) => set({ selectedListingId: id }),

  reset: () =>
    set({
      listings: [],
      status: "idle",
      hasSearched: false,
      error: null,
      cursor: null,
      totalCount: 0,
      sourceBreakdown: null,
      hoveredListingId: null,
      selectedListingId: null,
    }),
}));
