import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const callId = formData.get("callId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Upload each file to Supabase storage
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${callId ? `call_${callId}_` : ""}${Math.random()
        .toString(36)
        .substring(2, 15)}_${Date.now()}.${fileExt}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          cacheControl: "3600",
        });

      if (error) throw error;

      // If callId is provided, save metadata in database
      if (callId) {
        const { error: dbError } = await supabase
          .from("photo_metadata")
          .insert({
            path: data.path,
            call_id: callId,
            created_at: new Date().toISOString(),
          });

        if (dbError) console.error("Error saving photo metadata:", dbError);
      }

      return data.path;
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, paths: results });
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
