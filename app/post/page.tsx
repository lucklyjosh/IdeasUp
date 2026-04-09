import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BackButton } from "@/components/ui/BackButton"
import { PostForm } from "@/components/post/PostForm"
import { Card } from "@/components/ui/Card"

export default async function PostPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900">Share your idea</h1>
      <p className="mb-6 text-sm text-zinc-400">Let the community vote and give feedback before you start building.</p>
      <Card>
        <PostForm />
      </Card>
    </div>
  )
}
