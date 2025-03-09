"use client";

import type React from "react";

import { useState } from "react";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useToast } from "@/components/toast-provider";
import { supabase } from "@/utils/supabase";

interface PhotoUploadProps {
  callId: string;
}

export default function PhotoUpload({ callId }: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Create previews for the new files
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      // Use the Supabase client directly
      const uploadPromises = selectedFiles.map(async (file) => {
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

      await Promise.all(uploadPromises);

      setUploadComplete(true);
      toast({
        title: "Upload successful",
        description: `${selectedFiles.length} ${
          selectedFiles.length === 1 ? "photo" : "photos"
        } uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium">Click to select photos</p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 10MB</p>
        </label>
      </div>

      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">
              Selected Photos ({previews.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                previews.forEach((preview) => URL.revokeObjectURL(preview));
                setSelectedFiles([]);
                setPreviews([]);
              }}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group aspect-square">
                <Image
                  src={preview || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isUploading}
                  type="button"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : uploadComplete ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Uploaded Successfully
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {selectedFiles.length} Photo
                {selectedFiles.length !== 1 ? "s" : ""} for Call #{callId}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
