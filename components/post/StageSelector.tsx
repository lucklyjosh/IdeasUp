"use client"

import { cn } from "@/lib/utils/cn"

const STAGES = [
  { value: "IDEA", label: "Just an idea" },
  { value: "PROTOTYPE", label: "Prototype" },
  { value: "LIVE", label: "Live" },
] as const

type StageSelectorProps = {
  value?: string
  onChange: (value: string) => void
}

export function StageSelector({ value, onChange }: StageSelectorProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-zinc-700">Stage</label>
      <div className="flex gap-2">
        {STAGES.map((stage) => (
          <button
            key={stage.value}
            type="button"
            onClick={() => onChange(stage.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              value === stage.value
                ? "border-violet-500 bg-violet-50 text-violet-700"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
            )}
          >
            {stage.label}
          </button>
        ))}
      </div>
    </div>
  )
}
