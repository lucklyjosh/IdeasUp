import { cn } from "@/lib/utils/cn"

type CardProps = {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-2xl bg-white p-6 subtle-ring", className)}>
      {children}
    </div>
  )
}
