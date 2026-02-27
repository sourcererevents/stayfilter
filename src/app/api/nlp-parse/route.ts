import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  NLPResponseSchema,
  FILTER_ID_MAP,
  CATEGORY_IDS,
} from "@/lib/nlp-schema";

function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

function getClient() {
  return new Anthropic({ apiKey: getApiKey() });
}

const SYSTEM_PROMPT = `You are a search filter parser for a vacation rental search tool (Airbnb/VRBO).
The user will describe what they want in natural language. Your job is to extract structured filter parameters.

AVAILABLE FILTER IDs (organized by group):
${JSON.stringify(FILTER_ID_MAP, null, 0)}

AVAILABLE CATEGORY IDs (Airbnb property style categories):
${JSON.stringify(CATEGORY_IDS)}

ROOM TYPES (pick at most one): rt_entire, rt_private, rt_shared, rt_hotel

RULES:
1. Only use filter IDs and category IDs from the lists above. Never invent new ones.
2. For location: extract the destination city/area as a string in "location.query". If the user says "near X" or "within N hours of X", just use X as the location query. Put the distance/travel constraint in unmappedConstraints.
3. For dates: use YYYY-MM-DD format. If the user says "this weekend", calculate from today's date. If no dates mentioned, omit.
4. For guests: "sleeps 4" means adults=4. "2 adults and 2 kids" means adults=2, children=2. Pets/infants only if mentioned.
5. For price: extract min/max per night in USD. "under $200" = max=200. "$100-300" = min=100, max=300. "budget" ~ max=150. "luxury" ~ min=300.
6. For room counts: "2 bedroom" = minBedrooms=2. "2 beds" = minBeds=2. "2 bath" = minBathrooms=2.
7. For amenities: map user language to the closest filter ID. "jacuzzi"="hot_tub", "spa"="hot_tub", "grill"="bbq_grill", "parking"="free_parking", "ocean view"="waterfront", "ski access"="ski_in_out", "bbq"="bbq_grill", "internet"="wifi", "air con"="ac", "workspace"="dedicated_workspace".
8. For property style: map to category IDs. "cabin"="cat_cabins", "treehouse"="cat_treehouses", "beachfront"="cat_beach", "lakehouse"="cat_lakefront", "farm"="cat_farms", "castle"="cat_castles", "tiny house"="cat_tiny_homes", "a-frame"="cat_a_frames", "luxury"="cat_luxe", "camping"="cat_camping", "dome"="cat_domes", "yurt"="cat_yurts", "houseboat"="cat_houseboats", "vineyard"="cat_vineyards", "desert"="cat_desert", "tropical"="cat_tropical", "ski"="cat_skiing", "surf"="cat_surfing".
9. Room type: "entire place"="rt_entire", "private room"="rt_private", "shared room"="rt_shared", "hotel room"="rt_hotel", "whole house"="rt_entire", "own space"="rt_entire".
10. If the user mentions something you cannot map to any filter (e.g., "walking distance to downtown", "ocean view", "quiet neighborhood", "within 1.5 hours"), put it in unmappedConstraints so the UI can show a note.
11. "pet friendly" or "dog friendly" = add "allows_pets" to selectedFilters AND set guests.pets=1.
12. Return ONLY the fields that are relevant. Do not include empty arrays or null fields. Omit fields entirely if not mentioned.

Today's date is: ${new Date().toISOString().split("T")[0]}

Respond with ONLY a valid JSON object. No markdown, no code blocks, no explanation.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body?.query;

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters" },
        { status: 400 },
      );
    }

    if (!getApiKey()) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const client = getClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: query.trim() },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const content = textBlock?.text;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );
    }

    // Strip any markdown code fences if present
    const jsonStr = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const parsed = JSON.parse(jsonStr);
    const validated = NLPResponseSchema.parse(parsed);

    return NextResponse.json({
      success: true,
      filters: validated,
      tokenUsage: {
        input: response.usage?.input_tokens,
        output: response.usage?.output_tokens,
      },
    });
  } catch (err) {
    console.error("[nlp-parse] Error:", err);

    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json(
        { error: "AI response did not match expected schema" },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
