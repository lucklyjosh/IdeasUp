import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { BackButton } from "@/components/ui/BackButton"
import { PostForm } from "@/components/post/PostForm"
import { Card } from "@/components/ui/Card"

type PageProps = {
  params: { id: string }
}

export default async function EditPostPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) notFound()
  if (post.authorId !== user.id) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900">
        {post.type === "IDEA" ? "Edit idea" : "Edit need"}
      </h1>
      <p className="mb-6 text-sm text-zinc-400">Update your post and save changes.</p>
      <Card>
        <PostForm
          mode="edit"
          postId={post.id}
          initialValues={{
            type: post.type,
            title: post.title,
            description: post.description,
            stage: post.stage ?? undefined,
            industry: post.industry ?? undefined,
            techStack: post.techStack,
            links: post.links,
            willingToPay: post.willingToPay,
            categories: post.categories,
          }}
          initialMediaUrls={post.mediaUrls}
        />
      </Card>
    </div>
  )
}
