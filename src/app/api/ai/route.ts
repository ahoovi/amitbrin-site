import { NextRequest, NextResponse } from "next/server";

// API route for Claude AI calls
// Keeps the API key server-side (secure)

export async function POST(req: NextRequest) {
  const { messages, system } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1100,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: "AI request failed", detail: err },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 }
    );
  }
}
