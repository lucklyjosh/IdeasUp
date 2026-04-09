import { cn } from "@/lib/utils/cn"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:     "bg-zinc-900 text-white hover:bg-zinc-700 active:scale-[0.98]",
  secondary:   "bg-white ring-1 ring-inset ring-zinc-200 text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]",
  ghost:       "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
  destructive: "bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading ? <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  )
}
