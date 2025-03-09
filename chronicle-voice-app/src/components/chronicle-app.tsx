"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { JournalEntries } from "@/components/journal-entries"
import { EntryPanel } from "@/components/entry-panel"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Sample journal entries data
const sampleEntries = [
  {
    id: "1",
    title: "Morning Reflections",
    date: "Mar 8, 2025",
    content:
      "Today I woke up feeling refreshed and motivated. The weather was perfect for a morning walk, which helped clear my mind and set a positive tone for the day. I've been thinking about the new project at work and have some creative ideas I want to explore further.",
    type: "Daily",
    timestamp: "09:15 AM",
    images: [],
  },
  {
    id: "2",
    title: "Weekly Goals Review",
    date: "Mar 5, 2025",
    content:
      "Looking back at this week's accomplishments, I'm pleased with the progress on most of my goals. The team meeting on Tuesday was particularly productive - we finalized the design for the new feature and set clear milestones for the coming month. Still need to work on time management for better work-life balance.",
    type: "Weekly",
    timestamp: "04:30 PM",
    images: [],
  },
  {
    id: "3",
    title: "Trip Planning Thoughts",
    date: "Mar 1, 2025",
    content:
      "Started researching destinations for the summer vacation. Currently considering either a coastal retreat or a mountain getaway. Budget considerations will be important, but I think we can make it work with careful planning. Need to check with everyone about their preferences and availability dates.",
    type: "Personal",
    timestamp: "08:45 PM",
    images: [],
  },
]

export const ChronicleApp = () => {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [mode, setMode] = useState("Normal")
  const isMobile = useMobile()

  const handleEntrySelect = (entry) => {
    setSelectedEntry(entry)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
  }

  const handleBackToList = () => {
    setSelectedEntry(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header mode={mode} onModeChange={handleModeChange} />

      <div className="flex flex-1 overflow-hidden">
        {isMobile && selectedEntry ? (
          <div className="flex flex-col w-full h-full">
            <div className="p-4 border-b">
              <Button variant="ghost" onClick={handleBackToList} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to entries
              </Button>
            </div>
            <EntryPanel entry={selectedEntry} />
          </div>
        ) : (
          <>
            <div
              className={cn(
                "flex-1 overflow-hidden transition-all duration-300",
                selectedEntry && !isMobile ? "flex-[2]" : "flex-[3]",
              )}
            >
              <JournalEntries
                entries={sampleEntries}
                selectedEntryId={selectedEntry?.id}
                onEntrySelect={handleEntrySelect}
              />
            </div>

            {selectedEntry && !isMobile && (
              <div className="flex-[1] border-l border-border bg-card overflow-auto">
                <EntryPanel entry={selectedEntry} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

