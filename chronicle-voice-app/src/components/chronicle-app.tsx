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
          const transformedEntries = result.calls.map((call: any) => ({
            id: call.id,
            title:
              call.title ||
              `Call on ${new Date(call.timestamp).toLocaleDateString()}`,
            date: new Date(
              call.created_at || call.timestamp
            ).toLocaleDateString(),
            content:
              call.cleanedTranscript ||
              call.transcript ||
              "No transcript available",
            type: "call",
            timestamp: call.timestamp,
            created_at: call.created_at || call.timestamp,
            images: call.images || [],
          }));

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
