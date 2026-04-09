import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { VoteControl } from "@/components/ui/VoteControl"
import { formatDate } from "@/lib/utils/format"
import type { Post } from "@/types/post"
import type { User } from "@/types/user"

type PostHeaderProps = {
  post: Post & { author: User }
  currentUserId?: string
  currentUserVote?: 1 | -1 | null
}

const STAGE_LABEL: Record<string, string> = {
  IDEA: "Idea",
  PROTOTYPE: "Prototype",
  LIVE: "Live",
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
}

export function PostHeader({ post, currentUserId, currentUserVote }: PostHeaderProps) {
  return (
    <div className="rounded-2xl bg-white p-6 subtle-ring">
      <div className="flex gap-4">
        <VoteControl
          postId={post.id}
          initialScore={post.score}
          initialVote={currentUserVote}
          isAuthenticated={!!currentUserId}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge variant={post.type === "IDEA" ? "idea" : "need"}>
              {post.type === "IDEA" ? "Idea" : "Need"}
            </Badge>
            {post.type === "IDEA" && post.stage && (
              <Badge variant="stage">{STAGE_LABEL[post.stage]}</Badge>
            )}
            {post.type === "NEED" && post.industry && (
              <Badge variant="muted">{post.industry}</Badge>
            )}
            {post.type === "NEED" && (
              <Badge variant="stage">{STATUS_LABEL[post.status]}</Badge>
            )}
            {post.categories.map((cat) => (
              <Badge key={cat} variant="muted">{cat}</Badge>
            ))}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{post.title}</h1>

          <div className="mt-3 flex items-center gap-3 text-sm text-zinc-400">
            <Link
              href={`/profile/${post.author.username}`}
              className="flex items-center gap-2 transition-colors hover:text-zinc-600"
            >
              <Avatar src={post.author.avatarUrl} username={post.author.username} size="md" />
              <span className="font-medium">{post.author.username}</span>
            </Link>
            <span>{formatDate(post.createdAt)}</span>
            {post.type === "NEED" && post.willingToPay && (
              <span className="font-medium text-emerald-500">Willing to pay</span>
            )}
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-zinc-600 whitespace-pre-wrap">
            {post.description}
          </p>

          {post.techStack.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {post.techStack.map((tech) => (
                  <span key={tech} className="rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-100">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.links.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Links</h3>
              <div className="flex flex-col gap-1.5">
                {post.links.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-500 truncate"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {post.mediaUrls.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {post.mediaUrls.map((url) => (
                <div key={url} className="relative aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
