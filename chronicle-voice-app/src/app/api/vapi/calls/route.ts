import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Import Vapi client
import { VapiClient } from "@vapi-ai/server-sdk";

export async function GET() {
  try {
    const vapi = new VapiClient({
      token: process.env.VAPI_API_KEY!,
    });

    // Fetch calls using the Vapi client
    // This method name is an assumption based on common API patterns
    const calls = await vapi.calls.list();

    // Return the call data to the frontend
    return NextResponse.json({
      success: true,
      calls: calls,
    });
  } catch (error) {
    console.error("Error fetching calls from VAPI:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}
