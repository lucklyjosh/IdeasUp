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
  onUpdate: (id: string, body: string) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}

// Comments created and edited effectively simultaneously have a tiny
// timestamp gap from the DB write. Treat > 1s as an actual edit.
function isEdited(comment: Comment): boolean {
  const created = new Date(comment.createdAt).getTime()
  const updated = new Date(comment.updatedAt).getTime()
  return updated - created > 1000
}

export function CommentItem({ comment, currentUserId, onReply, onUpdate, onDelete }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editBody, setEditBody] = useState(comment.body)
  const [isSaving, setIsSaving] = useState(false)

  const isAuthor = currentUserId === comment.userId

  async function handleReply(body: string) {
    await onReply(body, comment.id)
    setIsReplying(false)
  }

  async function handleSaveEdit() {
    const trimmed = editBody.trim()
    if (!trimmed || trimmed === comment.body) {
      setIsEditing(false)
      setEditBody(comment.body)
      return
    }
    setIsSaving(true)
    const result = await onUpdate(comment.id, trimmed)
    setIsSaving(false)
    if (result) setIsEditing(false)
  }

  function handleCancelEdit() {
    setEditBody(comment.body)
    setIsEditing(false)
  }

  async function handleDelete() {
    if (!confirm("Delete this comment? Replies will also be removed.")) return
    await onDelete(comment.id)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar src={comment.user.avatarUrl} username={comment.user.username} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-zinc-900">{comment.user.username}</span>
            <span className="text-zinc-400">{formatRelativeTime(comment.createdAt)}</span>
            {isEdited(comment) && (
              <span
                className="text-xs text-zinc-400 italic"
                title={`Edited ${formatRelativeTime(comment.updatedAt)}`}
              >
                (edited)
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
                className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="rounded-md bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="rounded-md px-3 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-zinc-700 whitespace-pre-wrap">{comment.body}</p>
          )}

          {!isEditing && (
            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="hover:text-zinc-600"
              >
                {isReplying ? "Cancel" : "Reply"}
              </button>
              {isAuthor && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="hover:text-zinc-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="hover:text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

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
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
