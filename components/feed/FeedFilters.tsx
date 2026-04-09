"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { IDEA_CATEGORIES, INDUSTRIES } from "@/lib/utils/constants"

const SORT_OPTIONS = [
  { value: "top",    label: "Top" },
  { value: "new",    label: "New" },
]

type FeedFiltersProps = {
  type: "IDEA" | "NEED"
}

export function FeedFilters({ type }: FeedFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get("sort") ?? "top"
  const currentCategory = searchParams.get("category") ?? ""

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const categories = type === "IDEA" ? IDEA_CATEGORIES : INDUSTRIES

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100/80 p-0.5">
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setParam("sort", value)}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-medium transition-all",
              currentSort === value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setParam("category", "")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all",
            !currentCategory
              ? "bg-zinc-900 text-white"
              : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setParam("category", cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-all",
              currentCategory === cat
                ? "bg-zinc-900 text-white"
                : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
