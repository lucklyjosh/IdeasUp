"use client"

import { CommentInput } from "./CommentInput"
import { CommentItem } from "./CommentItem"
import { useComments } from "@/hooks/useComments"
import { useUiStore } from "@/store/ui"
import type { Comment } from "@/types/comment"

type CommentListProps = {
  postId: string
  currentUserId?: string
  initialComments: Comment[]
}

export function CommentList({ postId, currentUserId, initialComments }: CommentListProps) {
  const { comments, commentCount, addComment, addReply } = useComments({
    postId,
    initialComments,
  })
  const { openAuthModal } = useUiStore()

  async function handleAddComment(body: string) {
    if (!currentUserId) {
      openAuthModal("login")
      return
    }
    await addComment(body)
  }

  async function handleReply(body: string, parentId: string) {
    if (!currentUserId) {
      openAuthModal("login")
      return
    }
    await addReply(body, parentId)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900">
        Comments ({commentCount})
      </h2>

      <CommentInput postId={postId} onSubmit={handleAddComment} />

      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onReply={handleReply}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-zinc-400">No comments yet. Be the first!</p>
      )}
    </div>
  )
}
