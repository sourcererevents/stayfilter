import { z } from "zod";

// Zod schema for the GPT response — must match Zustand store shape
export const NLPResponseSchema = z.object({
  location: z
    .object({
      query: z.string().optional(),
    })
    .optional(),
  dates: z
    .object({
      checkin: z.string().nullable().optional(),
      checkout: z.string().nullable().optional(),
    })
    .optional(),
  guests: z
    .object({
      adults: z.number().int().min(1).max(16).optional(),
      children: z.number().int().min(0).max(10).optional(),
      infants: z.number().int().min(0).max(5).optional(),
      pets: z.number().int().min(0).max(5).optional(),
    })
    .optional(),
  priceRange: z
    .object({
      min: z.number().nullable().optional(),
      max: z.number().nullable().optional(),
    })
    .optional(),
  selectedFilters: z.array(z.string()).optional(),
  roomType: z.string().nullable().optional(),
  minBedrooms: z.number().int().min(0).max(8).optional(),
  minBeds: z.number().int().min(0).max(8).optional(),
  minBathrooms: z.number().int().min(0).max(8).optional(),
  selectedCategories: z.array(z.string()).optional(),
  unmappedConstraints: z.array(z.string()).optional(),
});

export type NLPResponse = z.infer<typeof NLPResponseSchema>;

// Compressed filter ID map for the GPT system prompt (~800 tokens)
// Derived from src/data/filters.ts — keep in sync when adding new filters
export const FILTER_ID_MAP = {
  "Popular Amenities": [
    "pool", "hot_tub", "sauna", "fireplace", "wifi", "kitchen", "ac",
    "washer", "dryer", "free_parking", "ev_charger", "gym", "bbq_grill",
    "fire_pit", "patio", "garden", "dedicated_workspace", "tv",
    "king_bed", "breakfast", "smoking_allowed",
  ],
  "Property Types": ["pt_house", "pt_guesthouse", "pt_apartment", "pt_hotel"],
  "Room Types (pick ONE)": ["rt_entire", "rt_private", "rt_shared", "rt_hotel"],
  "Bathroom": [
    "bathtub", "bidet", "body_soap", "cleaning_products", "conditioner",
    "hair_dryer", "hot_water", "outdoor_shower", "shampoo", "shower_gel",
  ],
  "Bedroom & Laundry": [
    "bed_linens", "clothing_storage", "drying_rack", "essentials",
    "extra_pillows", "hangers", "iron", "mosquito_net", "room_darkening", "safe",
  ],
  "Kitchen & Dining": [
    "baking_sheet", "bbq_utensils", "blender", "dinnerware", "bread_maker",
    "coffee", "coffee_maker", "dining_table", "dishwasher", "freezer",
    "hot_water_kettle", "microwave", "mini_fridge", "oven", "pots_pans",
    "refrigerator", "rice_maker", "stove", "toaster", "trash_compactor",
    "wine_glasses",
  ],
  "Entertainment": [
    "books", "ethernet", "exercise_equipment", "game_console", "piano",
    "ping_pong", "pool_table", "record_player", "sound_system",
  ],
  "Outdoor & Views": [
    "beach_essentials", "bikes", "boat_slip", "hammock", "kayak",
    "outdoor_dining", "outdoor_furniture", "outdoor_kitchen", "ski_in_out",
    "sun_loungers", "waterfront",
  ],
  "Heating & Cooling": ["ceiling_fan", "heating", "portable_fans"],
  "Home Safety": ["co_alarm", "fire_extinguisher", "first_aid", "smoke_alarm"],
  "Family & Children": [
    "baby_bath", "baby_monitor", "baby_gates", "babysitter_recs",
    "board_games", "changing_table", "childrens_books", "childrens_dinnerware",
    "crib", "fireplace_guards", "high_chair", "outlet_covers",
    "pack_n_play", "table_corner_guards", "window_guards",
  ],
  "Parking & Facilities": [
    "paid_parking_on", "paid_parking_off", "free_street_parking",
    "elevator", "single_level", "private_entrance",
  ],
  "Accessibility": [
    "step_free_entrance", "wide_entrance", "wide_hallways",
    "accessible_bathroom", "roll_in_shower", "shower_chair",
    "grab_bars", "disabled_parking", "wide_doorway",
  ],
  "Booking Options": [
    "superhost", "instant_book", "self_checkin", "flexible_cancel",
    "allows_pets", "guest_favorite",
  ],
  "Internet & Office": ["pocket_wifi"],
} as const;

export const CATEGORY_IDS = [
  "cat_amazing_pools", "cat_amazing_views", "cat_a_frames", "cat_arctic",
  "cat_barns", "cat_beach", "cat_boats", "cat_cabins", "cat_camping",
  "cat_castles", "cat_caves", "cat_chefs_kitchens", "cat_containers",
  "cat_countryside", "cat_creative_spaces", "cat_desert", "cat_design",
  "cat_domes", "cat_earth_homes", "cat_farms", "cat_golfing",
  "cat_grand_pianos", "cat_hanoks", "cat_historical", "cat_houseboats",
  "cat_islands", "cat_lakefront", "cat_luxe", "cat_mansions",
  "cat_national_parks", "cat_new", "cat_omg", "cat_play", "cat_riads",
  "cat_ryokans", "cat_shepherds_huts", "cat_skiing", "cat_surfing",
  "cat_tiny_homes", "cat_top_cities", "cat_towers", "cat_treehouses",
  "cat_trending", "cat_tropical", "cat_trulli", "cat_vineyards",
  "cat_windmills", "cat_yurts",
] as const;
