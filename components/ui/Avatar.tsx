import Image from "next/image"
import { cn } from "@/lib/utils/cn"

type AvatarProps = {
  src?: string | null
  username: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
}

const sizePx = { sm: 24, md: 32, lg: 40 }

export function Avatar({ src, username, size = "md", className }: AvatarProps) {
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-600 overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={username}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  )
}
