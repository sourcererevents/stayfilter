import { NextRequest, NextResponse } from "next/server";
import type { Listing, SearchResult } from "@/types/listing";

// Browser-like headers to avoid being flagged as a bot
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body as { url: string };

    if (!url || !url.includes("airbnb.com")) {
      return NextResponse.json(
        { status: "error", error: "Invalid Airbnb URL", listings: [], totalCount: 0, cursor: null },
        { status: 400 },
      );
    }

    console.log(`[search] Fetching: ${url}`);

    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
    });

    console.log(`[search] Response status: ${response.status}`);

    if (!response.ok) {
      return NextResponse.json({
        status: "blocked",
        error: `Airbnb returned ${response.status}`,
        listings: [],
        totalCount: 0,
        cursor: null,
        debugInfo: { fetchMethod: "html", responseStatus: response.status, parseMethod: "none" },
      } satisfies SearchResult);
    }

    const html = await response.text();
    console.log(`[search] HTML length: ${html.length}`);

    // Check for actual bot blocking (not just feature flag references to "recaptcha")
    const isBlocked =
      (html.includes("challenge-platform") && !html.includes("data-deferred-state")) ||
      html.includes("cf-browser-verification") ||
      html.includes("Please verify you are a human");

    if (isBlocked) {
      console.log("[search] Blocked by anti-bot protection");
      return NextResponse.json({
        status: "blocked",
        error: "Blocked by anti-bot protection",
        listings: [],
        totalCount: 0,
        cursor: null,
        debugInfo: { fetchMethod: "html", responseStatus: response.status, parseMethod: "blocked" },
      } satisfies SearchResult);
    }

    // Parse listings from the embedded deferred state data
    const result = parseDeferredState(html);

    if (result && result.listings.length > 0) {
      console.log(`[search] Parsed ${result.listings.length} listings`);
      return NextResponse.json(result);
    }

    console.log("[search] Could not parse listings. Has deferred-state:", html.includes("data-deferred-state"));
    return NextResponse.json({
      status: "error",
      error: "Could not parse listing data from response",
      listings: [],
      totalCount: 0,
      cursor: null,
      debugInfo: { fetchMethod: "html", responseStatus: response.status, parseMethod: "none_matched" },
    } satisfies SearchResult);
  } catch (err) {
    console.error("[search] Error:", err);
    return NextResponse.json({
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
      listings: [],
      totalCount: 0,
      cursor: null,
    } satisfies SearchResult);
  }
}

// ─── Parse Airbnb's deferred state script tags ───────────────────────────────
// Airbnb embeds SSR data in: <script id="data-deferred-state-0" data-deferred-state-0="true" type="application/json">
// Structure: { niobeClientData: [ [queryKey, { data: { presentation: { staysSearch: { results: { searchResults: [...] } } } } }] ] }
function parseDeferredState(html: string): SearchResult | null {
  try {
    const regex = /<script[^>]*data-deferred-state-\d+[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g;
    let match;
    const allListings: Listing[] = [];
    let paginationCursor: string | null = null;
    let estimatedTotal = 0;

    while ((match = regex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);

        // Check both niobeClientData and niobeMinimalClientData
        const niobeData = data.niobeClientData || data.niobeMinimalClientData;
        if (!Array.isArray(niobeData)) continue;

        for (const entry of niobeData) {
          if (!Array.isArray(entry) || entry.length < 2) continue;
          const entryData = entry[1];
          if (!entryData?.data?.presentation?.staysSearch) continue;

          const staysSearch = entryData.data.presentation.staysSearch;

          // Parse searchResults
          const searchResults = staysSearch.results?.searchResults;
          if (Array.isArray(searchResults)) {
            for (const result of searchResults) {
              const listing = normalizeSearchResult(result);
              if (listing) allListings.push(listing);
            }
          }

          // Also parse mapResults for coordinate data
          const mapResults = staysSearch.mapResults;
          if (Array.isArray(mapResults)) {
            for (const mapResult of mapResults) {
              // Fill in coordinates for listings that are missing them
              const mapListing = normalizeSearchResult(mapResult);
              if (mapListing && mapListing.lat !== 0) {
                const existing = allListings.find((l) => l.id === mapListing.id);
                if (existing && existing.lat === 0) {
                  existing.lat = mapListing.lat;
                  existing.lng = mapListing.lng;
                } else if (!existing) {
                  allListings.push(mapListing);
                }
              }
            }
          }

          // Get pagination info
          const paginationInfo = staysSearch.results?.paginationInfo;
          if (paginationInfo) {
            // nextPageCursor if provided directly
            if (paginationInfo.nextPageCursor) {
              paginationCursor = paginationInfo.nextPageCursor;
            }
            // Otherwise compute from pageCursors array — index 1 is the next page
            if (!paginationCursor && Array.isArray(paginationInfo.pageCursors) && paginationInfo.pageCursors.length > 1) {
              paginationCursor = paginationInfo.pageCursors[1];
            }
            // Estimate total count from pageCursors (each page = 18 listings)
            if (Array.isArray(paginationInfo.pageCursors)) {
              const pageCount = paginationInfo.pageCursors.length;
              estimatedTotal = Math.max(estimatedTotal, pageCount * 18);
            }
          }
        }
      } catch {
        // This deferred-state chunk didn't parse, try next
      }
    }

    if (allListings.length > 0) {
      return {
        status: "success",
        listings: allListings,
        totalCount: estimatedTotal > allListings.length ? estimatedTotal : allListings.length,
        cursor: paginationCursor,
        debugInfo: { fetchMethod: "html", responseStatus: 200, parseMethod: "deferred_state" },
      };
    }
  } catch {
    // Parse failed entirely
  }
  return null;
}

// ─── Normalize a search result into Listing ─────────────────────────────────
// Airbnb's search result shape (discovered from live data):
// {
//   title: "Treehouse in Chilliwack",
//   subtitle: "Mountain Therapy Retreat",
//   avgRatingLocalized: "5.0 (7)",
//   contextualPictures: [{ picture: "https://a0.muscache.com/..." }],
//   structuredDisplayPrice: { primaryLine: { price: "$1,373", qualifier: "for 5 nights" } },
//   badges: [{ loggingContext: { badgeType: "GUEST_FAVORITE" }, text: "Guest favorite" }],
//   demandStayListing: { id: "base64...", location: { coordinate: { latitude, longitude } } },
//   structuredContent: { primaryLine: [{ body: "2 beds", type: "BEDINFO" }] },
// }
function normalizeSearchResult(raw: unknown): Listing | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  // ── ID ──
  // Try demandStayListing.id (base64 encoded like "RGVtYW5kU3RheUxpc3Rpbmc6MTU3MDQyMTkwMTk1Mzc4NzE0OA==")
  // Decodes to "DemandStayListing:1570421901953787148" — we want the number part
  let id = "";
  const demandListing = r.demandStayListing as Record<string, unknown> | undefined;
  if (demandListing?.id) {
    try {
      const decoded = Buffer.from(String(demandListing.id), "base64").toString("utf-8");
      const numMatch = decoded.match(/:(\d+)$/);
      id = numMatch ? numMatch[1] : String(demandListing.id);
    } catch {
      id = String(demandListing.id);
    }
  }
  // Fallback: propertyId or listing.id
  if (!id) {
    id = String(r.propertyId || (r as Record<string, unknown>).id || "");
  }
  if (!id) return null;

  // ── Name ──
  const subtitle = String(r.subtitle || "");
  const title = String(r.title || "");
  const name = subtitle || title || "Untitled";
  const city = title; // "Treehouse in Chilliwack" → we keep the full title as city context

  // ── Coordinates ──
  let lat = 0;
  let lng = 0;
  if (demandListing?.location && typeof demandListing.location === "object") {
    const loc = demandListing.location as Record<string, unknown>;
    if (loc.coordinate && typeof loc.coordinate === "object") {
      const coord = loc.coordinate as Record<string, number>;
      lat = coord.latitude || 0;
      lng = coord.longitude || 0;
    }
  }
  // Fallback for direct coordinate fields
  if (lat === 0 && typeof r.lat === "number") {
    lat = r.lat as number;
    lng = (r.lng || r.longitude) as number || 0;
  }

  // ── Images ──
  const images: Listing["images"] = [];
  if (Array.isArray(r.contextualPictures)) {
    for (const pic of r.contextualPictures) {
      if (pic && typeof pic === "object") {
        const p = pic as Record<string, unknown>;
        const url = String(p.picture || p.url || "");
        if (url) images.push({ url, caption: p.caption as string | undefined });
      }
    }
  }

  // ── Price ──
  let priceAmount = 0;
  let originalPrice = 0;
  let priceQualifier = "per night";
  const displayPrice = r.structuredDisplayPrice as Record<string, unknown> | undefined;
  if (displayPrice?.primaryLine && typeof displayPrice.primaryLine === "object") {
    const primary = displayPrice.primaryLine as Record<string, unknown>;
    // Two formats: QualifiedDisplayPriceLine has "price", DiscountedDisplayPriceLine has "discountedPrice"/"originalPrice"
    const priceStr = String(primary.discountedPrice || primary.price || "");
    priceAmount = parsePrice(priceStr);
    if (primary.originalPrice) {
      originalPrice = parsePrice(String(primary.originalPrice));
    }
    priceQualifier = String(primary.qualifier || "per night");
    // Fallback: parse from accessibilityLabel if still $0 (e.g., "$279 for 5 nights, originally $398")
    if (priceAmount === 0 && primary.accessibilityLabel) {
      const accMatch = String(primary.accessibilityLabel).match(/\$([\d,]+)/);
      if (accMatch) priceAmount = parsePrice(`$${accMatch[1]}`);
    }
  }

  // ── Rating ──
  let rating: number | null = null;
  let reviewCount = 0;
  if (r.avgRatingLocalized && typeof r.avgRatingLocalized === "string") {
    // Format: "5.0 (7)" or "4.85 (234)"
    const ratingMatch = r.avgRatingLocalized.match(/([\d.]+)\s*\((\d+)\)/);
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[1]);
      reviewCount = parseInt(ratingMatch[2], 10);
    }
  }

  // ── Badges ──
  const badges: string[] = [];
  if (Array.isArray(r.badges)) {
    for (const badge of r.badges) {
      if (badge && typeof badge === "object") {
        const b = badge as Record<string, unknown>;
        const loggingCtx = b.loggingContext as Record<string, unknown> | undefined;
        if (loggingCtx?.badgeType) {
          badges.push(String(loggingCtx.badgeType));
        }
      }
    }
  }

  // ── Room info from structuredContent ──
  let roomType = "";
  const content = r.structuredContent as Record<string, unknown> | undefined;
  if (content?.primaryLine && Array.isArray(content.primaryLine)) {
    const parts = content.primaryLine
      .filter((item: unknown) => item && typeof item === "object")
      .map((item: unknown) => String((item as Record<string, unknown>).body || ""))
      .filter(Boolean);
    roomType = parts.join(" \u00B7 "); // "1 bedroom · 2 beds"
  }

  return {
    id,
    source: "airbnb" as const,
    name,
    roomType,
    lat,
    lng,
    images,
    price: { amount: priceAmount, currency: "USD", qualifier: priceQualifier, originalAmount: originalPrice || undefined },
    rating,
    reviewCount,
    badges: [...new Set(badges)],
    listingUrl: `https://www.airbnb.com/rooms/${id}`,
    city,
  };
}

function parsePrice(priceStr: string): number {
  const match = priceStr.match(/[\d,]+/);
  if (match) return parseInt(match[0].replace(/,/g, ""), 10);
  return 0;
}
