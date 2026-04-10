import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { Avatar } from "@/components/ui/Avatar"
import { BackButton } from "@/components/ui/BackButton"
import { FeedList } from "@/components/feed/FeedList"
import { formatDate } from "@/lib/utils/format"

type PageProps = {
  params: { username: string }
}

export default async function ProfilePage({ params }: PageProps) {
  const profileUser = await prisma.user.findUnique({
    where: { username: params.username },
  })

  if (!profileUser) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const posts = await prisma.post.findMany({
    where: { authorId: profileUser.id },
    include: {
      author: true,
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalScore = posts.reduce<number>((sum, p) => sum + p.score, 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="mb-10 flex items-start gap-4">
        <Avatar src={profileUser.avatarUrl} username={profileUser.username} size="lg" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{profileUser.username}</h1>
          {profileUser.bio && (
            <p className="mt-1 text-sm text-zinc-500">{profileUser.bio}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-300">
            <span>Joined {formatDate(profileUser.createdAt)}</span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {posts.length} posts
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
              {totalScore} karma
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Posts</h2>
      <FeedList posts={posts} currentUserId={user?.id} />
    </div>
  )
}
