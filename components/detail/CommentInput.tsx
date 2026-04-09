"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

type CommentInputProps = {
  postId: string
  parentId?: string
  onSubmit: (body: string) => Promise<unknown>
  placeholder?: string
  autoFocus?: boolean
}

export function CommentInput({ onSubmit, placeholder = "Write a comment...", autoFocus = false }: CommentInputProps) {
  const [body, setBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(body.trim())
      setBody("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={2}
        className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
      />
      <Button type="submit" size="sm" disabled={!body.trim()} isLoading={isSubmitting}>
        Post
      </Button>
    </form>
  )
}
