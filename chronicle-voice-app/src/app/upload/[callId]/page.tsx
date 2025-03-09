"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload, X, Check, Loader2 } from "lucide-react";

interface UploadPageProps {
  params: {
    callId: string;
  };
}

export default function UploadPage({ params }: UploadPageProps) {
  const { callId } = params;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

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
    if (selectedFiles.length === 0) {
      setUploadMessage("Please select at least one photo to upload.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");
    setUploadComplete(false);

    try {
      // Create a FormData object to hold the files
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("callId", callId);

      // Send the files to the server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadComplete(true);
        setUploadMessage(
          `${selectedFiles.length} photo${
            selectedFiles.length > 1 ? "s" : ""
          } uploaded successfully for call #${callId}.`
        );

        // Clean up previews and reset state after successful upload
        previews.forEach((preview) => URL.revokeObjectURL(preview));
        setSelectedFiles([]);
        setPreviews([]);

        // Reset upload complete status after a delay
        setTimeout(() => setUploadComplete(false), 3000);
      } else {
        setUploadMessage(
          result.error || "There was an error uploading your photos."
        );
      }
    } catch (error) {
      setUploadMessage("There was an error uploading your photos.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Upload Photos for Call #{callId}
      </h1>
      <p className="text-gray-500 mb-8">
        Add photos related to your call. You can select multiple photos at once.
      </p>

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
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF up to 10MB
            </p>
          </label>
        </div>

        {uploadMessage && (
          <div
            className={`p-4 rounded-md ${
              uploadComplete
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {uploadMessage}
          </div>
        )}

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
    </div>
  );
}
