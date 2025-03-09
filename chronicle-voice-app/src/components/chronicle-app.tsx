"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { EntryPanel } from "@/components/entry-panel";
import { EntriesList } from "./entries-list";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { fetchAndProcessCalls } from "@/lib/api-utils";

interface Entry {
  id: string;
  title: string;
  date: string;
  content: string;
  type: string;
  timestamp: string;
  created_at: string;
  images: string[];
}

export const ChronicleApp = () => {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [mode, setMode] = useState("Normal");
  const isMobile = useMobile();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch entries when component mounts
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAndProcessCalls();

        if (result.success && result.calls) {
          // Transform calls into entries format
          const transformedEntries = result.calls.map((call: any) => {
            // Validate dates
            const validateDate = (dateString: string) => {
              if (!dateString) return null;
              const date = new Date(dateString);
              return !isNaN(date.getTime()) ? date : null;
            };

            // Use the most specific date available for each call
            const createdAtDate = validateDate(call.created_at);
            const timestampDate = validateDate(call.timestamp);

            // Generate a unique fallback date if none is available
            const generateFallbackDate = () => {
              // Create a deterministic date offset based on call ID to ensure unique dates
              const idHash = call.id
                ? call.id
                    .split("")
                    .reduce(
                      (acc: number, char: string) => acc + char.charCodeAt(0),
                      0
                    )
                : 0;
              const date = new Date();
              date.setHours(date.getHours() - (idHash % 24));
              date.setMinutes(date.getMinutes() - (idHash % 60));
              return date;
            };

            const validDate =
              createdAtDate || timestampDate || generateFallbackDate();
            const displayDate = validDate.toLocaleDateString();

            return {
              id: call.id,
              title: call.title || `Call on ${displayDate}`,
              date: displayDate,
              content:
                call.cleanedTranscript ||
                call.transcript ||
                "No transcript available",
              type: "call",
              timestamp: validDate.toISOString(),
              created_at:
                call.created_at || call.timestamp || validDate.toISOString(),
              images: call.images || [],
            };
          });

          setEntries(transformedEntries);
        } else {
          setError(result.error || "Failed to fetch entries");
        }
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching entries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleEntrySelect = (entry: Entry) => {
    setSelectedEntry(entry);
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header mode={mode} onModeChange={handleModeChange} />

      <div className="flex flex-1 overflow-hidden">
        {isMobile && selectedEntry ? (
          <div className="flex flex-col w-full h-full">
            <div className="p-4 border-b">
              <Button
                variant="ghost"
                onClick={handleBackToList}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to entries
              </Button>
            </div>
            <EntryPanel entry={selectedEntry} />
          </div>
        ) : (
          <>
            <div
              className={`h-full ${
                selectedEntry && !isMobile ? "w-1/3" : "w-full"
              } border-r`}
            >
              <EntriesList
                entries={entries}
                onEntrySelect={handleEntrySelect}
                selectedEntry={selectedEntry}
                loading={loading}
                error={error}
              />
            </div>

            {selectedEntry && !isMobile && (
              <div className="w-2/3 h-full">
                <EntryPanel entry={selectedEntry} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
