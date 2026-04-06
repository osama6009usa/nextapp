import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { content, prompt } = await req.json();
    if (!content || !prompt) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: [content, { type: "text", text: prompt }] }],
    });
    const rawText = response.content[0]?.type === "text" ? response.content[0].text : "";
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    try {
      return NextResponse.json(JSON.parse(cleaned));
    } catch {
      return NextResponse.json({ raw_text: rawText, error: "PARSE_FAILED" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "vision_failed" }, { status: 500 });
  }
}
