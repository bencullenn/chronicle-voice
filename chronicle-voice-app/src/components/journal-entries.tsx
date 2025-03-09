"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

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

interface JournalEntriesProps {
  entries: Entry[];
  selectedEntryId: string | null;
  onEntrySelect: (entry: Entry) => void;
}

export function JournalEntries({
  entries,
  selectedEntryId,
  onEntrySelect,
}: JournalEntriesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardClick = (entry: Entry) => {
    if (expandedId === entry.id) {
      setExpandedId(null);
    } else {
      setExpandedId(entry.id);
    }
    onEntrySelect(entry);
  };

  const getContentPreview = (content: string) => {
    return content.length > 150 ? `${content.substring(0, 150)}...` : content;
  };

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

  return (
    <div className="h-full overflow-auto p-6 space-y-4">
      <AnimatePresence>
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                expandedId === entry.id ? "shadow-md" : "shadow-sm",
                selectedEntryId === entry.id
                  ? "border-primary"
                  : "border-border"
              )}
              onClick={() => handleCardClick(entry)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{entry.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {entry.date}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {expandedId === entry.id
                    ? entry.content
                    : getContentPreview(entry.content)}
                </p>

                {expandedId === entry.id && entry.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {entry.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-muted rounded-md overflow-hidden relative"
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {expandedId === entry.id && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="aspect-square w-20 bg-muted/50 rounded-md border border-dashed border-muted-foreground/30 flex items-center justify-center"
                      >
                        <span className="text-xs text-muted-foreground">
                          Add
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 text-xs text-muted-foreground flex justify-between">
                <span>{entry.type}</span>
                <span>{formatTimestamp(entry.timestamp)}</span>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
