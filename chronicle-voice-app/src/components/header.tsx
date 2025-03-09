"use client"

import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface HeaderProps {
  mode: string
  onModeChange: (mode: string) => void
}

export function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background border-b border-border py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-medium text-foreground">My Entries</div>

        <h1 className="text-2xl font-bold text-center text-primary absolute left-1/2 transform -translate-x-1/2">
          Chronicle AI Voice Journal
        </h1>

        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "px-3 py-2 text-sm",
                  mode === "Severance" && "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100",
                )}
              >
                {mode} <span className="ml-1.5">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onModeChange("Normal")}>Normal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModeChange("Severance")}>Severance</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="shadow-md">
            <Phone className="h-4 w-4 mr-2" />
            Call Me
          </Button>
        </div>
      </div>
    </header>
  )
}

