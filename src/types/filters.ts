export type Platform = "airbnb" | "vrbo";

export interface FilterOption {
  id: string;
  label: string;
  airbnbParam?: string; // e.g., "amenities[]=25"
  airbnbId?: number;
  vrboParam?: string;
  icon?: string; // Lucide icon name
  description?: string;
}

export interface FilterCategory {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  filters: FilterOption[];
  type: "checkbox" | "toggle" | "range" | "select";
  exclusive?: boolean; // Only one can be selected (radio behavior)
}

export type FilterLogic = "and" | "or";

export interface FilterGroup {
  id: string;
  label: string;
  categories: FilterCategory[];
  /** How Airbnb combines multiple selections in this group.
   *  "or" = show listings matching ANY selected (e.g. property types)
   *  "and" = show listings matching ALL selected (e.g. amenities) */
  logic: FilterLogic;
  /** Short tip shown in the UI about how this group behaves */
  logicTip?: string;
}

export interface LocationState {
  query: string;
  placeId?: string;
}

export interface DateRange {
  checkin: string | null; // YYYY-MM-DD
  checkout: string | null;
}

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface FilterState {
  // Primary filters
  location: LocationState;
  dates: DateRange;
  guests: GuestCounts;
  priceRange: PriceRange;

  // Selected filter IDs
  selectedFilters: Set<string>;

  // Room type
  roomType: string | null; // "entire" | "private" | "shared" | "hotel"

  // Bedrooms/beds/baths
  minBedrooms: number;
  minBeds: number;
  minBathrooms: number;

  // Boolean flags
  superhost: boolean;
  instantBook: boolean;
  selfCheckin: boolean;
  flexibleCancel: boolean;

  // Category tag (Airbnb categories like Cabins, Treehouses)
  categoryTag: string | null;
}

export interface SearchUrl {
  platform: Platform;
  url: string;
  filterCount: number;
}
