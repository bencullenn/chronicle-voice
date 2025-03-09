import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Entry {
  id: string
  title: string
  date: string
  content: string
  type: string
  timestamp: string
  images: string[]
}

interface EntryPanelProps {
  entry: Entry
}

export function EntryPanel({ entry }: EntryPanelProps) {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">{entry.title}</h2>
          <p className="text-sm text-muted-foreground">{entry.date}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Contents</h3>
          <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Images</h3>
          <div className="grid grid-cols-3 gap-3">
            {entry.images.length > 0
              ? entry.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              : Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="aspect-square bg-muted/50 rounded-md border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4 text-muted-foreground/70" />
                    <span className="text-xs text-muted-foreground/70">Add image</span>
                  </div>
                ))}
          </div>

          <Button variant="outline" className="mt-4 w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add more images
          </Button>
        </div>
      </div>
    </div>
  )
}

