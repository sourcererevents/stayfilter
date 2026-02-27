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
    if (store.guests.adults > 1) params.push(`adults=${store.guests.adults}`);
    if (store.guests.children > 0) params.push(`children=${store.guests.children}`);

    // Price range
    if (store.priceRange.min !== null) params.push(`minPrice=${store.priceRange.min}`);
    if (store.priceRange.max !== null) params.push(`maxPrice=${store.priceRange.max}`);

    // Room counts — VRBO uses "bedrooms" / "bathrooms" (not minBedrooms)
    if (store.minBedrooms > 0) params.push(`bedrooms=${store.minBedrooms}`);
    if (store.minBathrooms > 0) params.push(`bathrooms=${store.minBathrooms}`);

    // ── Collect VRBO filter groups ──
    const amenities: string[] = [];
    const propertyTypes: string[] = [];
    const locations: string[] = [];
    const houseRules: string[] = [];
    const accessibility: string[] = [];
    const safety: string[] = [];
    const bookingOptions: string[] = [];
    const commonSpaces: string[] = [];

    // ── Amenity mapping (StayFilter ID → VRBO amenity value) ──
    // Verified against actual VRBO search URL parameters
    const vrboAmenityMap: Record<string, string> = {
      // Popular
      pool:              "POOL",
      hot_tub:           "HOT_TUB",
      fireplace:         "FIREPLACE",
      wifi:              "INTERNET_AVAILABLE",
      ac:                "AIR_CONDITIONING",
      washer:            "WASHER",
      dryer:             "CLOTHES_DRYER",
      free_parking:      "PARKING",
      ev_charger:        "ELECTRIC_VEHICLE_CHARGING_STATION",
      bbq_grill:         "OUTDOOR_GRILL",
      patio:             "PATIO_OR_DECK",
      garden:            "GARDEN_OR_BACKYARD",
      tv:                "TELEVISION",
      king_bed:          "KING_SIZED_BED",
      // Kitchen & Dining
      kitchen:           "KITCHEN",
      dishwasher:        "DISHWASHER",
      microwave:         "MICROWAVE",
      stove:             "STOVE",
      oven:              "OVEN",
      // Bedroom & Laundry
      bed_linens:        "BED_LINENS_PROVIDED",
      iron:              "IRON_AND_BOARD",
      // Family
      crib:              "CRIB",
      high_chair:        "KIDS_HIGH_CHAIR",
      // Outdoor
      patio_balcony:     "BALCONY",
    };

    // ── Property type mapping (StayFilter ID → VRBO property_type_group) ──
    const vrboPropertyTypeMap: Record<string, string> = {
      pt_house:      "house",
      pt_apartment:  "apartment_or_condo",
      pt_hotel:      "hotel",
    };

    // ── Location mapping (StayFilter ID → VRBO location_group) ──
    const vrboLocationMap: Record<string, string> = {
      ski_in_out:    "skiin_skiout",
      waterfront:    "waterfront",
    };

    // ── Safety mapping (StayFilter ID → VRBO safety_group) ──
    const vrboSafetyMap: Record<string, string> = {
      co_alarm:      "carbon_monoxide_detector",
      smoke_alarm:   "smoke_detector",
    };

    // ── Accessibility mapping (StayFilter ID → VRBO accessibility_features_group) ──
    const vrboAccessibilityMap: Record<string, string> = {
      step_free_entrance: "stair_free_path_to_entrance",
      elevator:           "elevator",
      single_level:       "single_level_property",
      disabled_parking:   "accessible_parking",
      accessible_bathroom: "accessible_path",
      grab_bars:          "handrail_stairway_hallway",
    };

    // ── Booking / special params ──
    const vrboBookingMap: Record<string, string> = {
      instant_book:     "instant_confirmation",
    };

    // Process all selected filters
    store.selectedFilters.forEach((filterId) => {
      if (vrboAmenityMap[filterId]) {
        amenities.push(vrboAmenityMap[filterId]);
      } else if (vrboPropertyTypeMap[filterId]) {
        propertyTypes.push(vrboPropertyTypeMap[filterId]);
      } else if (vrboLocationMap[filterId]) {
        locations.push(vrboLocationMap[filterId]);
      } else if (vrboSafetyMap[filterId]) {
        safety.push(vrboSafetyMap[filterId]);
      } else if (vrboAccessibilityMap[filterId]) {
        accessibility.push(vrboAccessibilityMap[filterId]);
      } else if (vrboBookingMap[filterId]) {
        bookingOptions.push(vrboBookingMap[filterId]);
      }

      // Special handling for kitchen as common space
      if (filterId === "kitchen") {
        commonSpaces.push("kitchen");
      }

      // Pet-friendly needs both a top-level param and house rule
      if (filterId === "allows_pets") {
        params.push("petIncluded=true");
        houseRules.push("pets_allowed");
      }

      // Free cancellation has its own group
      if (filterId === "flexible_cancel") {
        params.push("free_cancellation_group=free_cancellation");
      }

      // Smoking allowed → house rule
      if (filterId === "smoking_allowed") {
        houseRules.push("smoking_allowed");
      }
    });

    // ── Airbnb categories → VRBO property types ──
    const categoryToVrboType: Record<string, string> = {
      cat_cabins:      "cabin",
      cat_a_frames:    "cabin",       // closest VRBO equivalent
      cat_castles:     "estate",
      cat_mansions:    "estate",
      cat_farms:       "house",
      cat_houseboats:  "house",
      cat_treehouses:  "cabin",
      cat_tiny_homes:  "cottage",
      cat_countryside: "cottage",
      cat_vineyards:   "villa",
      cat_tropical:    "villa",
      cat_luxe:        "villa",
    };

    // Airbnb categories → VRBO location filters
    const categoryToVrboLocation: Record<string, string> = {
      cat_beach:       "beach",
      cat_lakefront:   "lake_location",
      cat_islands:     "oceanfront",
      cat_skiing:      "skiin_skiout",
      cat_surfing:     "beach",
      cat_desert:      "rural_location",
      cat_national_parks: "mountains_location",
    };

    store.selectedCategories.forEach((catId) => {
      if (categoryToVrboType[catId]) {
        const type = categoryToVrboType[catId];
        if (!propertyTypes.includes(type)) propertyTypes.push(type);
      }
      if (categoryToVrboLocation[catId]) {
        const loc = categoryToVrboLocation[catId];
        if (!locations.includes(loc)) locations.push(loc);
      }
    });

    // ── Append grouped params (comma-separated) ──
    if (amenities.length > 0) params.push(`amenities=${amenities.join(",")}`);
    if (propertyTypes.length > 0) params.push(`property_type_group=${propertyTypes.join(",")}`);
    if (locations.length > 0) params.push(`location_group=${locations.join(",")}`);
    if (houseRules.length > 0) params.push(`house_rules_group=${houseRules.join(",")}`);
    if (safety.length > 0) params.push(`safety_group=${safety.join(",")}`);
    if (accessibility.length > 0) params.push(`accessibility_features_group=${accessibility.join(",")}`);
    if (bookingOptions.length > 0) params.push(`booking_options_group=${bookingOptions.join(",")}`);
    if (commonSpaces.length > 0) params.push(`common_spaces_group=${commonSpaces.join(",")}`);

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
