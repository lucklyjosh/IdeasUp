"use client"

import { cn } from "@/lib/utils/cn"
import { formatNumber } from "@/lib/utils/format"
import { useVote } from "@/hooks/useVote"
import { useUiStore } from "@/store/ui"

type VoteControlProps = {
  postId: string
  initialScore: number
  initialVote?: 1 | -1 | null
  isAuthenticated?: boolean
}

export function VoteControl({
  postId,
  initialScore,
  initialVote = null,
  isAuthenticated = false,
}: VoteControlProps) {
  const { score, currentVote, isLoading, handleVote } = useVote({
    postId,
    initialScore,
    initialVote,
  })
  const { openAuthModal } = useUiStore()

  function onVoteClick(value: 1 | -1) {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    handleVote(value)
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => onVoteClick(1)}
        disabled={isLoading}
        aria-label="Upvote"
        className={cn(
          "rounded p-1 transition-colors",
          currentVote === 1
            ? "text-violet-600"
            : "text-zinc-400 hover:text-zinc-700"
        )}
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3L14 11H2L8 3Z" />
        </svg>
      </button>
      <span className={cn("text-xs font-semibold tabular-nums", currentVote === 1 ? "text-violet-600" : currentVote === -1 ? "text-red-500" : "text-zinc-600")}>
        {formatNumber(score)}
      </span>
      <button
        onClick={() => onVoteClick(-1)}
        disabled={isLoading}
        aria-label="Downvote"
        className={cn(
          "rounded p-1 transition-colors",
          currentVote === -1
            ? "text-red-500"
            : "text-zinc-400 hover:text-zinc-700"
        )}
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 13L2 5H14L8 13Z" />
        </svg>
      </button>
    </div>
  )
}
