import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are a precise health data extractor. 
Extract data from WHOOP app screenshots and return ONLY valid JSON.
Never include explanations, markdown, or extra text.
If a value is not visible in any screenshot, return null for that field.`;

const USER_PROMPT = `These are screenshots from WHOOP app. Extract all available data and return JSON only, no other text: {recovery_percent, hrv_ms, sleep_hours, sleep_performance, strain, resting_hr, deep_sleep_hours, rem_sleep_hours, sleep_consistency_percent, sleep_efficiency_percent}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const images = formData.getAll("images") as File[];

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Convert images to base64
    const imageContents: Anthropic.ImageBlockParam[] = await Promise.all(
      images.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mediaType = (file.type || "image/jpeg") as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp";

        return {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType,
            data: base64,
          },
        };
      })
    );

    // Build message content: all images + prompt
    const messageContent: Anthropic.ContentBlockParam[] = [
      ...imageContents,
      { type: "text", text: USER_PROMPT },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    // Extract text response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON — strip any accidental markdown fences
    let rawText = textBlock.text.trim();
    rawText = rawText.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");

    let extracted: Record<string, number | null>;
    try {
      extracted = JSON.parse(rawText);
    } catch {
      throw new Error(`Failed to parse Claude response: ${rawText.slice(0, 200)}`);
    }

    // Validate & normalise the 10 expected fields
    const FIELDS = [
      "recovery_percent",
      "hrv_ms",
      "sleep_hours",
      "sleep_performance",
      "strain",
      "resting_hr",
      "deep_sleep_hours",
      "rem_sleep_hours",
      "sleep_consistency_percent",
      "sleep_efficiency_percent",
    ] as const;

    const validated: Record<string, number | null> = {};
    for (const field of FIELDS) {
      const val = extracted[field];
      validated[field] =
        val !== undefined && val !== null && !isNaN(Number(val))
          ? Number(val)
          : null;
    }

    return NextResponse.json(validated);
  } catch (error: unknown) {
    console.error("[WHOOP extract]", error);
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Allow large payloads for base64 images
export const config = {
  api: {
    bodyParser: false,
  },
};
