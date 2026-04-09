import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createCommentSchema } from "@/lib/validations/comment"
import type { ApiResponse } from "@/types/post"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("postId")

  if (!postId) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "postId is required" },
      { status: 400 }
    )
  }

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    include: {
      user: true,
      replies: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json<ApiResponse<typeof comments>>({ data: comments, error: null })
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
  const parsed = createCommentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { postId, body: commentBody, parentId } = parsed.data

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Post not found" },
      { status: 404 }
    )
  }

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (!parent || parent.postId !== postId) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Parent comment not found" },
        { status: 404 }
      )
    }
  }

  const comment = await prisma.comment.create({
    data: {
      body: commentBody,
      userId: user.id,
      postId,
      parentId: parentId ?? null,
    },
    include: { user: true },
  })

  return NextResponse.json<ApiResponse<typeof comment>>({ data: comment, error: null }, { status: 201 })
}
