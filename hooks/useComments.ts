"use client"

import { useState, useCallback } from "react"
import type { Comment } from "@/types/comment"

type UseCommentsOptions = {
  postId: string
  initialComments?: Comment[]
}

export function useComments({ postId, initialComments = [] }: UseCommentsOptions) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/comments?postId=${postId}`)
      if (!res.ok) throw new Error("Failed to fetch comments")

      const { data } = await res.json()
      setComments(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch comments")
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  const addComment = useCallback(
    async (body: string) => {
      setError(null)

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error ?? "Failed to add comment")
        return null
      }

      const { data } = await res.json()
      setComments((prev) => [{ ...data, replies: [] }, ...prev])
      return data as Comment
    },
    [postId]
  )

  const addReply = useCallback(
    async (body: string, parentId: string) => {
      setError(null)

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body, parentId }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error ?? "Failed to add reply")
        return null
      }

      const { data } = await res.json()
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), data] }
            : c
        )
      )
      return data as Comment
    },
    [postId]
  )

  const commentCount = comments.reduce(
    (total, c) => total + 1 + (c.replies?.length ?? 0),
    0
  )

  return {
    comments,
    commentCount,
    isLoading,
    error,
    fetchComments,
    addComment,
    addReply,
  }
}
