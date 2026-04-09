"use client"

import { useState } from "react"
import { Avatar } from "@/components/ui/Avatar"
import { formatRelativeTime } from "@/lib/utils/format"
import { CommentInput } from "./CommentInput"
import type { Comment } from "@/types/comment"

type CommentItemProps = {
  comment: Comment
  currentUserId?: string
  onReply: (body: string, parentId: string) => Promise<unknown>
}

export function CommentItem({ comment, currentUserId, onReply }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)

  async function handleReply(body: string) {
    await onReply(body, comment.id)
    setIsReplying(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar src={comment.user.avatarUrl} username={comment.user.username} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-zinc-900">{comment.user.username}</span>
            <span className="text-zinc-400">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-700 whitespace-pre-wrap">{comment.body}</p>
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="mt-1 text-xs text-zinc-400 hover:text-zinc-600"
          >
            {isReplying ? "Cancel" : "Reply"}
          </button>

          {isReplying && (
            <div className="mt-2">
              <CommentInput
                postId={comment.postId}
                parentId={comment.id}
                onSubmit={handleReply}
                placeholder="Write a reply..."
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-9 space-y-3 border-l-2 border-zinc-100 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}
