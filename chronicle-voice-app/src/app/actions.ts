"use server";

import { supabase } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

export async function uploadPhotos(files: File[], callId?: string) {
  try {
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

    // Revalidate the path to show the new photos
    revalidatePath("/");
    if (callId) {
      revalidatePath(`/upload/${callId}`);
    }

    return { success: true, paths: results };
  } catch (error) {
    console.error("Error uploading photos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
