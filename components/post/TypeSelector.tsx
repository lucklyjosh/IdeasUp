"use client"

import { cn } from "@/lib/utils/cn"

type TypeSelectorProps = {
  value: "IDEA" | "NEED"
  onChange: (value: "IDEA" | "NEED") => void
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="flex rounded-lg border border-zinc-200 p-1">
      <button
        type="button"
        onClick={() => onChange("IDEA")}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
          value === "IDEA"
            ? "bg-violet-100 text-violet-700"
            : "text-zinc-500 hover:text-zinc-700"
        )}
      >
        Idea
      </button>
      <button
        type="button"
        onClick={() => onChange("NEED")}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
          value === "NEED"
            ? "bg-amber-100 text-amber-700"
            : "text-zinc-500 hover:text-zinc-700"
        )}
      >
        Need
      </button>
    </div>
  )
}
