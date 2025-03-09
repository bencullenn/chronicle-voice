import { NextResponse } from "next/server";

// Constants for OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Helper function to validate and normalize dates
function validateDate(dateString: string | undefined | null): string {
  if (!dateString) {
    return new Date().toISOString();
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateString}, using current time`);
    return new Date().toISOString();
  }

  return date.toISOString();
}

export async function POST(request: Request) {
  try {
    // 1. Get transcript data from request body
    const { transcript, created_at } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: "Transcript data is required" },
        { status: 400 }
      );
    }

    // Validate and normalize the created_at date
    const validatedCreatedAt = validateDate(created_at);

    // 2. Call OpenAI API to clean up the transcript
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo", // Use appropriate model
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
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const cleanedData = await response.json();

    // 3. Return the cleaned transcript
    // OpenAI response format is different from Anthropic
    return NextResponse.json({
      success: true,
      cleanedTranscript: cleanedData.choices[0].message.content,
      created_at: validatedCreatedAt, // Always return a valid date
    });
  } catch (error) {
    console.error("Error cleaning transcript with OpenAI API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clean transcript" },
      { status: 500 }
    );
  }
}
