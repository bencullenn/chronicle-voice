import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // 1. Get call IDs from request body
    const { callIds } = await request.json();

    if (!callIds || !Array.isArray(callIds)) {
      return NextResponse.json(
        { success: false, error: "Call IDs must be provided as an array" },
        { status: 400 }
      );
    }

    // 2. Check which calls exist in Supabase
    const { data: existingCalls, error } = await supabase
      .from("entry")
      .select("call_id")
      .in("call_id", callIds);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    // 3. Determine which calls do not exist in the database
    const existingCallIds = existingCalls.map((call) => call.call_id);
    const missingCallIds = callIds.filter(
      (id) => !existingCallIds.includes(id)
    );

    return NextResponse.json({
      success: true,
      existingCallIds,
      missingCallIds,
    });
  } catch (error) {
    console.error("Error checking calls in database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check calls in database" },
      { status: 500 }
    );
  }
}
