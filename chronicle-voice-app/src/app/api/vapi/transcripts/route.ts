import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { VapiClient } from "@vapi-ai/server-sdk";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Vapi server-side client
const vapi = new VapiClient({
  token: process.env.VAPI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    // 1. Get call IDs from request body
    const { callIds } = await request.json();

    if (!callIds || !Array.isArray(callIds) || callIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Call IDs must be provided as a non-empty array",
        },
        { status: 400 }
      );
    }

    // 2. Process each call ID
    const results = await Promise.all(
      callIds.map(async (callId) => {
        try {
          // 2.1 Get transcript from VAPI using the server-side client
          const call = await vapi.calls.get(callId);
          const transcriptData = call.artifact?.transcript;

          // 2.2 Store in Supabase
          const { error } = await supabase.from("entry").upsert({
            call_id: callId,
            transcript: transcriptData,
            created_at: new Date().toISOString(),
          });

          if (error) {
            throw new Error(`Supabase error: ${error.message}`);
          }

          return { callId, success: true };
        } catch (error) {
          console.error(`Error processing call ID ${callId}:`, error);
          return { callId, success: false, error: (error as Error).message };
        }
      })
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching transcripts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch and store transcripts" },
      { status: 500 }
    );
  }
}
