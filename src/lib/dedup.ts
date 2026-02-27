import type { Listing, ListingSource } from "@/types/listing";

/**
 * Deduplicates listings from multiple sources (Airbnb + VRBO).
 *
 * When a property is listed on both platforms, we keep the Airbnb listing
 * and annotate it with cross-listing info (VRBO price + URL).
 *
 * Match criteria:
 * - Coordinate proximity: within ~100m (0.001 degrees lat/lng)
 * - Name similarity: Jaccard index > 0.6 on word tokens
 */

const COORD_THRESHOLD = 0.001; // ~100 meters
const NAME_SIMILARITY_THRESHOLD = 0.6;

export function deduplicateListings(listings: Listing[]): Listing[] {
  const airbnb = listings.filter((l) => l.source === "airbnb");
  const vrbo = listings.filter((l) => l.source === "vrbo");

  // If only one source, nothing to dedup
  if (airbnb.length === 0 || vrbo.length === 0) return listings;

  const matchedVrboIds = new Set<string>();

  // For each Airbnb listing, try to find a matching VRBO listing
  const merged = airbnb.map((ab) => {
    if (ab.lat === 0 && ab.lng === 0) return ab; // Can't match without coordinates

    for (const vr of vrbo) {
      if (matchedVrboIds.has(vr.id)) continue; // Already matched
      if (vr.lat === 0 && vr.lng === 0) continue;

      const coordClose =
        Math.abs(ab.lat - vr.lat) < COORD_THRESHOLD &&
        Math.abs(ab.lng - vr.lng) < COORD_THRESHOLD;

      if (!coordClose) continue;

      const nameSim = jaccardSimilarity(ab.name, vr.name);
      if (nameSim < NAME_SIMILARITY_THRESHOLD) continue;

      // Match found — annotate the Airbnb listing with VRBO cross-listing info
      matchedVrboIds.add(vr.id);
      return {
        ...ab,
        crossListedOn: "vrbo" as ListingSource,
        crossListedPrice: vr.price,
        crossListedUrl: vr.listingUrl,
      };
    }

    return ab;
  });

  // Add unmatched VRBO listings to the result
  const unmatchedVrbo = vrbo.filter((vr) => !matchedVrboIds.has(vr.id));

  return [...merged, ...unmatchedVrbo];
}

/**
 * Jaccard similarity on word tokens (case-insensitive).
 * Returns 0..1 where 1 = identical word sets.
 */
function jaccardSimilarity(a: string, b: string): number {
  const wordsA = tokenize(a);
  const wordsB = tokenize(b);

  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

/** Tokenize a string into lowercase words, filtering noise words */
const NOISE_WORDS = new Set([
  "the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
  "with", "near", "by", "from", "-", "–", "&",
]);

function tokenize(str: string): Set<string> {
  const words = str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !NOISE_WORDS.has(w));
  return new Set(words);
}
