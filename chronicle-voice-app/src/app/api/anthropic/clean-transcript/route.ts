import { NextResponse } from "next/server";

// Constants for Anthropic API
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export async function POST(request: Request) {
  try {
    // 1. Get transcript data from request body
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: "Transcript data is required" },
        { status: 400 }
      );
    }

    // 2. Call Anthropic API to clean up the transcript
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01", // Update this as needed
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // Use appropriate model
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Turn this call transcript into a journal entry.

${transcript}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Anthropic API error: ${JSON.stringify(errorData)}`);
    }

    const cleanedData = await response.json();

    // 3. Return the cleaned transcript
    return NextResponse.json({
      success: true,
      cleanedTranscript: cleanedData.content[0].text,
    });
  } catch (error) {
    console.error("Error cleaning transcript with Anthropic API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clean transcript" },
      { status: 500 }
    );
  }
}
