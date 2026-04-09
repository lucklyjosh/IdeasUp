import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { FeedList } from "@/components/feed/FeedList"
import { FeedSegment } from "@/components/feed/FeedSegment"
import { FeedFilters } from "@/components/feed/FeedFilters"
import { FEED_PAGE_SIZE } from "@/lib/utils/constants"

type PageProps = {
  searchParams: { sort?: string; category?: string }
}

export default async function NeedsPage({ searchParams }: PageProps) {
  const sort = searchParams.sort === "new" ? "new" : "top"
  const category = searchParams.category ?? ""

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const posts = await prisma.post.findMany({
    where: {
      type: "NEED",
      ...(category ? { categories: { has: category } } : {}),
    },
    include: {
      author: true,
      _count: { select: { comments: true } },
    },
    orderBy: sort === "new" ? { createdAt: "desc" } : { score: "desc" },
    take: FEED_PAGE_SIZE,
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4">
        <FeedSegment />
        <Suspense>
          <FeedFilters type="NEED" />
        </Suspense>
      </div>
      <FeedList posts={posts} currentUserId={user?.id} />
    </div>
  )
}
