import { cn } from "@/lib/utils/cn"

type BadgeVariant = "default" | "idea" | "need" | "stage" | "muted"

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-zinc-100 text-zinc-600",
  idea:    "bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100",
  need:    "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100",
  stage:   "bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100",
  muted:   "bg-zinc-50 text-zinc-400 ring-1 ring-inset ring-zinc-100",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
