import { FeedCard } from "./FeedCard"
import type { Post } from "@/types/post"
import type { User } from "@/types/user"

type FeedListProps = {
  posts: (Post & {
    author: User
    _count: { comments: number }
  })[]
  currentUserId?: string
}

export function FeedList({ posts, currentUserId }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-16 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
          <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-400">Nothing here yet</p>
        <p className="mt-1 text-xs text-zinc-300">Be the first to post.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {posts.map((post) => (
        <FeedCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
