import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch all entries from Supabase
    const { data: entries, error } = await supabase
      .from("entry")
      .select("call_id, created_at, transcript");

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      entries,
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}
