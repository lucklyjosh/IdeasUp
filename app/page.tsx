import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { FeedList } from "@/components/feed/FeedList"
import { FeedSegment } from "@/components/feed/FeedSegment"
import { FEED_PAGE_SIZE } from "@/lib/utils/constants"

type PageProps = {
  searchParams: { sort?: string }
}

export default async function HomePage({ searchParams }: PageProps) {
  const sort = searchParams.sort === "new" ? "new" : "top"

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const posts = await prisma.post.findMany({
    include: {
      author: true,
      _count: { select: { comments: true } },
    },
    orderBy: sort === "new" ? { createdAt: "desc" } : { score: "desc" },
    take: FEED_PAGE_SIZE,
  })

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient border-b">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-3 py-1 text-xs font-medium text-violet-700">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            Validate before you build
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">
            Let the market tell you<br />
            <span className="text-violet-600">before you build.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-zinc-500">
            Got a startup idea or a side project? Share it here and get real votes and feedback from builders and buyers — before you spend weeks building something nobody wants.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/post"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-700 hover:shadow-lg active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Share your idea
            </Link>
            <Link
              href="/needs"
              className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:shadow-sm active:scale-[0.98]"
            >
              Browse what people need
            </Link>
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Suspense>
            <FeedSegment />
          </Suspense>
        </div>

        <FeedList posts={posts} currentUserId={user?.id} />
      </section>
    </div>
  )
}
