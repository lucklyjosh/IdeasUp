import Link from "next/link"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { VoteControl } from "@/components/ui/VoteControl"
import { formatRelativeTime } from "@/lib/utils/format"
import type { Post } from "@/types/post"
import type { User } from "@/types/user"

type FeedCardProps = {
  post: Post & {
    author: User
    _count: { comments: number }
  }
  currentUserId?: string
  currentUserVote?: 1 | -1 | null
}

const STAGE_LABEL: Record<string, string> = {
  IDEA: "Idea",
  PROTOTYPE: "Prototype",
  LIVE: "Live",
}

export function FeedCard({ post, currentUserId, currentUserVote }: FeedCardProps) {
  const href = post.type === "IDEA" ? `/ideas/${post.id}` : `/needs/${post.id}`

  return (
    <div className="group rounded-2xl bg-white p-4 subtle-ring card-hover">
      <div className="flex gap-3">
        <VoteControl
          postId={post.id}
          initialScore={post.score}
          initialVote={currentUserVote}
          isAuthenticated={!!currentUserId}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge variant={post.type === "IDEA" ? "idea" : "need"}>
              {post.type === "IDEA" ? "Idea" : "Need"}
            </Badge>
            {post.type === "IDEA" && post.stage && (
              <Badge variant="stage">{STAGE_LABEL[post.stage]}</Badge>
            )}
            {post.type === "NEED" && post.industry && (
              <Badge variant="muted">{post.industry}</Badge>
            )}
            {post.categories.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="muted">{cat}</Badge>
            ))}
          </div>

          <Link href={href} className="group/title">
            <h2 className="font-semibold text-zinc-900 group-hover/title:text-violet-600 transition-colors line-clamp-1">
              {post.title}
            </h2>
          </Link>

          <p className="mt-0.5 text-sm leading-relaxed text-zinc-400 line-clamp-2">{post.description}</p>

          {post.techStack.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {post.techStack.slice(0, 5).map((tech) => (
                <span key={tech} className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 ring-1 ring-inset ring-zinc-100">
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-300">
            <Link
              href={`/profile/${post.author.username}`}
              className="flex items-center gap-1.5 transition-colors hover:text-zinc-500"
            >
              <Avatar src={post.author.avatarUrl} username={post.author.username} size="sm" />
              <span>{post.author.username}</span>
            </Link>
            <span>{formatRelativeTime(post.createdAt)}</span>
            <Link href={href} className="flex items-center gap-1 transition-colors hover:text-zinc-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {post._count.comments}
            </Link>
            {post.type === "NEED" && post.willingToPay && (
              <span className="font-medium text-emerald-500">Paid</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
