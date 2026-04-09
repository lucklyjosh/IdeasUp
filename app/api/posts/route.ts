import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createPostSchema } from "@/lib/validations/post"
import { FEED_PAGE_SIZE } from "@/lib/utils/constants"
import type { ApiResponse } from "@/types/post"
import type { PostType } from "@/types/post"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get("cursor")
  const sort = searchParams.get("sort") === "new" ? "new" : "top"
  const type = searchParams.get("type") as PostType | null

  const where = type ? { type } : {}

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: true,
      _count: { select: { comments: true } },
    },
    orderBy: sort === "new" ? { createdAt: "desc" } : { score: "desc" },
    take: FEED_PAGE_SIZE,
    ...(cursor
      ? { skip: 1, cursor: { id: cursor } }
      : {}),
  })

  return NextResponse.json<ApiResponse<typeof posts>>({ data: posts, error: null })
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()
  const parsed = createPostSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { type, title, description, stage, industry, techStack, links, willingToPay, categories } = parsed.data

  const post = await prisma.post.create({
    data: {
      type,
      title,
      description,
      stage: type === "IDEA" ? stage : undefined,
      industry: type === "NEED" ? industry : undefined,
      techStack: techStack ?? [],
      links: links ?? [],
      mediaUrls: [],
      willingToPay: type === "NEED" ? (willingToPay ?? false) : false,
      categories: categories ?? [],
      authorId: user.id,
    },
  })

  return NextResponse.json<ApiResponse<typeof post>>({ data: post, error: null }, { status: 201 })
}
