"use client"

import { useState, useCallback } from "react"

type UseVoteOptions = {
  postId: string
  initialScore: number
  initialVote?: 1 | -1 | null
}

export function useVote({ postId, initialScore, initialVote = null }: UseVoteOptions) {
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState<1 | -1 | null>(initialVote)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = useCallback(
    async (value: 1 | -1) => {
      if (isLoading) return

      const prev = { score, currentVote }
      const newVote = currentVote === value ? null : value
      const delta =
        newVote === null
          ? -value
          : currentVote === null
            ? value
            : value * 2

      // Optimistic update
      setScore((s) => s + delta)
      setCurrentVote(newVote)
      setIsLoading(true)

      try {
        const res = await fetch("/api/votes", {
          method: newVote === null ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, value }),
        })

        if (!res.ok) throw new Error("Vote failed")
      } catch {
        // Rollback on error
        setScore(prev.score)
        setCurrentVote(prev.currentVote)
      } finally {
        setIsLoading(false)
      }
    },
    [postId, score, currentVote, isLoading]
  )

  return { score, currentVote, isLoading, handleVote }
}
