import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Spinner } from "./ui/spinner";

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

interface EntriesListProps {
  entries: Entry[];
  onEntrySelect: (entry: Entry) => void;
  selectedEntry: Entry | null;
  loading: boolean;
  error: string | null;
}

export const EntriesList = ({
  entries,
  onEntrySelect,
  selectedEntry,
  loading,
  error,
}: EntriesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Format timestamp function
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown time";
      }

      // Format as "10:30 AM" time string
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.warn("Error formatting timestamp:", error);
      return "Unknown time";
    }
  };

  // Filter entries based on search term
  const filteredEntries = entries.filter((entry) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.date.toLowerCase().includes(searchLower) ||
      entry.type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>Error loading entries: {error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {searchTerm
              ? "No entries match your search"
              : "No entries found. Start by adding an entry."}
          </div>
        ) : (
          <ul className="divide-y">
            {filteredEntries.map((entry) => (
              <li
                key={entry.id}
                className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedEntry?.id === entry.id ? "bg-accent" : ""
                }`}
                onClick={() => onEntrySelect(entry)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-base truncate">
                    {entry.title}
                  </h3>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {entry.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {entry.content}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs bg-accent-foreground/10 text-accent-foreground px-2 py-0.5 rounded-full">
                    {entry.type}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
