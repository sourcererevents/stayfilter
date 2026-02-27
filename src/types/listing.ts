export type ListingSource = "airbnb" | "vrbo";

export interface ListingImage {
  url: string;
  caption?: string;
}

export interface ListingPrice {
  amount: number;
  currency: string;
  qualifier: string; // "per night", "for 5 nights", etc.
  total?: number;
  originalAmount?: number; // strikethrough price (discounted listings)
}

export interface Listing {
  id: string;
  source: ListingSource;
  name: string;
  roomType: string;
  lat: number;
  lng: number;
  images: ListingImage[];
  price: ListingPrice;
  rating: number | null;
  reviewCount: number;
  badges: string[]; // "SUPERHOST", "GUEST_FAVORITE", "PREMIER_HOST"
  listingUrl: string;
  propertyType?: string;
  city?: string;
  // Cross-listing dedup info (when same property found on both platforms)
  crossListedOn?: ListingSource;
  crossListedPrice?: ListingPrice;
  crossListedUrl?: string;
}

/** @deprecated Use `Listing` instead — kept for backward compatibility during migration */
export type AirbnbListing = Listing;

export interface SearchResult {
  listings: Listing[];
  totalCount: number;
  cursor: string | null;
  status: "success" | "partial" | "blocked" | "error";
  error?: string;
  sourceBreakdown?: { airbnb: number; vrbo: number };
  debugInfo?: {
    fetchMethod: string;
    responseStatus: number;
    parseMethod: string;
  };
}

export interface SearchPayload {
  url: string; // The full Airbnb search URL we already build
  // Optional overrides for server-side bounding box search
  location?: {
    query: string;
    lat?: number;
    lon?: number;
  };
}
