import { forwardRef } from "react"
import { cn } from "@/lib/utils/cn"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm",
            "placeholder:text-zinc-400",
            "focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500",
            "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
