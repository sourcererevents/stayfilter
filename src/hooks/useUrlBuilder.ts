import { useFilterStore } from "@/stores/filterStore";
import { FILTER_GROUPS, AIRBNB_CATEGORIES } from "@/data/filters";
import type { FilterOption } from "@/types/filters";

function findFilterOption(filterId: string): FilterOption | undefined {
  for (const group of FILTER_GROUPS) {
    for (const category of group.categories) {
      const found = category.filters.find((f) => f.id === filterId);
      if (found) return found;
    }
  }
  return undefined;
}

export function useUrlBuilder() {
  const store = useFilterStore();

  function buildAirbnbUrl(): string {
    const location = store.location.query || "anywhere";
    // Airbnb URL format: commas become "--", spaces become "-"
    // e.g. "British Columbia, Canada" → "British-Columbia--Canada"
    const slug = location
      .replace(/,\s*/g, "--") // ", " or "," → "--"
      .replace(/\s+/g, "-");  // spaces → "-"
    const base = `https://www.airbnb.com/s/${encodeURIComponent(slug)}/homes`;
    const params: string[] = [];

    // Dates
    if (store.dates.checkin) params.push(`checkin=${store.dates.checkin}`);
    if (store.dates.checkout) params.push(`checkout=${store.dates.checkout}`);

    // Guests
    if (store.guests.adults > 1) params.push(`adults=${store.guests.adults}`);
    if (store.guests.children > 0) params.push(`children=${store.guests.children}`);
    if (store.guests.infants > 0) params.push(`infants=${store.guests.infants}`);
    if (store.guests.pets > 0) params.push(`pets=${store.guests.pets}`);

    // Price range
    if (store.priceRange.min !== null) params.push(`price_min=${store.priceRange.min}`);
    if (store.priceRange.max !== null) params.push(`price_max=${store.priceRange.max}`);

    // Room counts
    if (store.minBedrooms > 0) params.push(`min_bedrooms=${store.minBedrooms}`);
    if (store.minBeds > 0) params.push(`min_beds=${store.minBeds}`);
    if (store.minBathrooms > 0) params.push(`min_bathrooms=${store.minBathrooms}`);

    // Category tags (multiple = OR logic)
    store.selectedCategories.forEach((catId) => {
      const cat = AIRBNB_CATEGORIES.find((c) => c.id === catId);
      if (cat) params.push(`category_tag=${cat.tag}`);
    });

    // All selected filters — add their airbnbParam
    store.selectedFilters.forEach((filterId) => {
      const option = findFilterOption(filterId);
      if (option?.airbnbParam) {
        params.push(option.airbnbParam);
      }
    });

    if (params.length === 0) return base;
    return `${base}?${params.join("&")}`;
  }

  function buildVrboUrl(): string {
    const location = store.location.query || "anywhere";
    const encodedLocation = encodeURIComponent(location);
    const base = `https://www.vrbo.com/search`;
    const params: string[] = [`destination=${encodedLocation}`];

    // Dates
    if (store.dates.checkin && store.dates.checkout) {
      params.push(`startDate=${store.dates.checkin}`);
      params.push(`endDate=${store.dates.checkout}`);
    }

    // Guests
    const totalGuests = store.guests.adults + store.guests.children;
    if (totalGuests > 1) params.push(`adults=${store.guests.adults}`);
    if (store.guests.children > 0) params.push(`children=${store.guests.children}`);

    // Price range
    if (store.priceRange.min !== null) params.push(`minPrice=${store.priceRange.min}`);
    if (store.priceRange.max !== null) params.push(`maxPrice=${store.priceRange.max}`);

    // Room counts
    if (store.minBedrooms > 0) params.push(`minBedrooms=${store.minBedrooms}`);
    if (store.minBathrooms > 0) params.push(`minBathrooms=${store.minBathrooms}`);

    // VRBO amenity mapping (subset — VRBO uses different filter keys)
    const vrboAmenityMap: Record<string, string> = {
      pool: "amenities=POOL",
      hot_tub: "amenities=HOT_TUB",
      ac: "amenities=AIR_CONDITIONING",
      wifi: "amenities=INTERNET",
      washer: "amenities=WASHER",
      dryer: "amenities=DRYER",
      kitchen: "amenities=KITCHEN",
      fireplace: "amenities=FIREPLACE",
      gym: "amenities=GYM",
      bbq_grill: "amenities=GRILL",
      free_parking: "amenities=PARKING",
      ev_charger: "amenities=EV_CHARGER",
      tv: "amenities=TV",
      dishwasher: "amenities=DISHWASHER",
      patio: "amenities=DECK_PATIO",
    };

    store.selectedFilters.forEach((filterId) => {
      if (vrboAmenityMap[filterId]) {
        params.push(vrboAmenityMap[filterId]);
      }
    });

    return `${base}?${params.join("&")}`;
  }

  function getActiveFilterLabels(): string[] {
    const labels: string[] = [];
    store.selectedFilters.forEach((filterId) => {
      const option = findFilterOption(filterId);
      if (option) labels.push(option.label);
    });
    store.selectedCategories.forEach((catId) => {
      const cat = AIRBNB_CATEGORIES.find((c) => c.id === catId);
      if (cat) labels.push(cat.label);
    });
    return labels;
  }

  return {
    buildAirbnbUrl,
    buildVrboUrl,
    getActiveFilterLabels,
  };
}
