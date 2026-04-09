"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"

const SEGMENTS = [
  { href: "/",      label: "All" },
  { href: "/ideas", label: "Ideas" },
  { href: "/needs", label: "Needs" },
]

export function FeedSegment() {
  const pathname = usePathname()

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100/80 p-0.5">
      {SEGMENTS.map(({ href, label }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
