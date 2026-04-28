import { NextRequest, NextResponse } from "next/server";

// API route for 11Labs text-to-speech
// Will be used by the Romanian learning app
// Keeps the API key server-side (secure)

export async function POST(req: NextRequest) {
  const { text, voice_id } = await req.json();

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "11Labs API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id || "default"}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "TTS request failed" },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "TTS service unavailable" },
      { status: 503 }
    );
  }
}
