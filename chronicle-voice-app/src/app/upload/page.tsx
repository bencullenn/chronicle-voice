"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [callId, setCallId] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (callId.trim()) {
      router.push(`/upload/${callId}`);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Upload Photos for a Call</h1>
      <p className="text-gray-500 mb-8">
        Enter the call ID to upload photos related to your call.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="callId" className="block text-sm font-medium mb-1">
            Call ID
          </label>
          <Input
            id="callId"
            value={callId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCallId(e.target.value)
            }
            placeholder="Enter the call ID (e.g., 12345)"
            className="w-full"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Continue to Upload
        </Button>
      </form>
    </div>
  );
}
