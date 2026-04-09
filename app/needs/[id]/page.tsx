import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { BackButton } from "@/components/ui/BackButton"
import { PostHeader } from "@/components/detail/PostHeader"
import { CommentList } from "@/components/detail/CommentList"

type PageProps = {
  params: { id: string }
}

export default async function NeedDetailPage({ params }: PageProps) {
  const post = await prisma.post.findUnique({
    where: { id: params.id, type: "NEED" },
    include: {
      author: true,
      comments: {
        where: { parentId: null },
        include: {
          user: true,
          replies: {
            include: { user: true },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!post) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentUserVote: 1 | -1 | null = null
  if (user) {
    const vote = await prisma.vote.findUnique({
      where: { userId_postId: { userId: user.id, postId: post.id } },
    })
    if (vote) currentUserVote = vote.value as 1 | -1
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <BackButton />
      </div>

      <PostHeader
        post={post}
        currentUserId={user?.id}
        currentUserVote={currentUserVote}
      />

      <div className="mt-10">
        <CommentList
          postId={post.id}
          currentUserId={user?.id}
          initialComments={post.comments}
        />
      </div>
    </div>
  )
}
