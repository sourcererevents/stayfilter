import { create } from "zustand";
import type { DateRange, GuestCounts, LocationState, PriceRange } from "@/types/filters";

interface FilterStore {
  // Primary filters
  location: LocationState;
  dates: DateRange;
  guests: GuestCounts;
  priceRange: PriceRange;

  // Selected amenity/property/booking filter IDs
  selectedFilters: Set<string>;

  // Room type
  roomType: string | null;

  // Bedrooms/beds/baths
  minBedrooms: number;
  minBeds: number;
  minBathrooms: number;

  // Category tags (Airbnb categories — multi-select OR logic)
  selectedCategories: Set<string>;

  // Actions
  setLocation: (location: LocationState) => void;
  setDates: (dates: DateRange) => void;
  setGuests: (guests: Partial<GuestCounts>) => void;
  setPriceRange: (range: Partial<PriceRange>) => void;
  toggleFilter: (filterId: string) => void;
  setRoomType: (type: string | null) => void;
  setMinBedrooms: (count: number) => void;
  setMinBeds: (count: number) => void;
  setMinBathrooms: (count: number) => void;
  toggleCategory: (categoryId: string) => void;
  clearCategories: () => void;
  clearAllFilters: () => void;
  clearCategory: (filterIds: string[]) => void;
  getActiveFilterCount: () => number;
}

const initialGuests: GuestCounts = { adults: 1, children: 0, infants: 0, pets: 0 };
const initialPriceRange: PriceRange = { min: null, max: null };
const initialDates: DateRange = { checkin: null, checkout: null };
const initialLocation: LocationState = { query: "" };

export const useFilterStore = create<FilterStore>((set, get) => ({
  location: initialLocation,
  dates: initialDates,
  guests: initialGuests,
  priceRange: initialPriceRange,
  selectedFilters: new Set<string>(),
  roomType: null,
  minBedrooms: 0,
  minBeds: 0,
  minBathrooms: 0,
  selectedCategories: new Set<string>(),

  setLocation: (location) => set({ location }),

  setDates: (dates) => set({ dates }),

  setGuests: (partial) =>
    set((state) => ({ guests: { ...state.guests, ...partial } })),

  setPriceRange: (partial) =>
    set((state) => ({ priceRange: { ...state.priceRange, ...partial } })),

  toggleFilter: (filterId) =>
    set((state) => {
      const next = new Set(state.selectedFilters);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return { selectedFilters: next };
    }),

  setRoomType: (type) => set({ roomType: type }),

  setMinBedrooms: (count) => set({ minBedrooms: count }),
  setMinBeds: (count) => set({ minBeds: count }),
  setMinBathrooms: (count) => set({ minBathrooms: count }),

  toggleCategory: (categoryId) =>
    set((state) => {
      const next = new Set(state.selectedCategories);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return { selectedCategories: next };
    }),

  clearCategories: () => set({ selectedCategories: new Set<string>() }),

  clearAllFilters: () =>
    set({
      selectedFilters: new Set<string>(),
      roomType: null,
      minBedrooms: 0,
      minBeds: 0,
      minBathrooms: 0,
      priceRange: initialPriceRange,
      guests: initialGuests,
      dates: initialDates,
      location: initialLocation,
      selectedCategories: new Set<string>(),
    }),

  clearCategory: (filterIds) =>
    set((state) => {
      const next = new Set(state.selectedFilters);
      filterIds.forEach((id) => next.delete(id));
      return { selectedFilters: next };
    }),

  getActiveFilterCount: () => {
    const state = get();
    let count = state.selectedFilters.size;
    if (state.roomType) count++;
    if (state.minBedrooms > 0) count++;
    if (state.minBeds > 0) count++;
    if (state.minBathrooms > 0) count++;
    if (state.priceRange.min !== null || state.priceRange.max !== null) count++;
    count += state.selectedCategories.size;
    return count;
  },
}));
