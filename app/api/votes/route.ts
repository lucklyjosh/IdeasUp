import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { voteSchema } from "@/lib/validations/vote"
import type { ApiResponse } from "@/types/post"

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
  const parsed = voteSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { postId, value } = parsed.data

  const existing = await prisma.vote.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  })

  if (existing) {
    // Update existing vote
    const delta = value - existing.value

    const [vote] = await prisma.$transaction([
      prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { score: { increment: delta } },
      }),
    ])

    return NextResponse.json<ApiResponse<typeof vote>>({ data: vote, error: null })
  }

  // Create new vote
  const [vote] = await prisma.$transaction([
    prisma.vote.create({
      data: { userId: user.id, postId, value },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { score: { increment: value } },
    }),
  ])

  return NextResponse.json<ApiResponse<typeof vote>>({ data: vote, error: null }, { status: 201 })
}

export async function DELETE(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { postId } = await req.json()

  if (!postId || typeof postId !== "string") {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "postId is required" },
      { status: 400 }
    )
  }

  const existing = await prisma.vote.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  })

  if (!existing) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Vote not found" },
      { status: 404 }
    )
  }

  await prisma.$transaction([
    prisma.vote.delete({ where: { id: existing.id } }),
    prisma.post.update({
      where: { id: postId },
      data: { score: { decrement: existing.value } },
    }),
  ])

  return NextResponse.json<ApiResponse<null>>({ data: null, error: null })
}
