"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type PostActionsProps = {
  postId: string
  postType: "IDEA" | "NEED"
}

export function PostActions({ postId, postType }: PostActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return
    setIsDeleting(true)
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Failed to delete post" }))
      alert(error ?? "Failed to delete post")
      setIsDeleting(false)
      return
    }
    router.push(postType === "IDEA" ? "/ideas" : "/needs")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3 text-xs text-zinc-400">
      <button
        type="button"
        onClick={() => router.push(`/post/${postId}/edit`)}
        className="hover:text-zinc-600"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="hover:text-red-600 disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  )
}
