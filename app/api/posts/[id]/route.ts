import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { updatePostSchema } from "@/lib/validations/post"
import type { ApiResponse } from "@/types/post"

type RouteContext = { params: { id: string } }

export async function PATCH(req: Request, { params }: RouteContext) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Post not found" },
      { status: 404 }
    )
  }

  if (existing.authorId !== user.id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Forbidden" },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parsed = updatePostSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { title, description, stage, industry, techStack, links, willingToPay, categories } = parsed.data

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title,
      description,
      stage: existing.type === "IDEA" ? stage : undefined,
      industry: existing.type === "NEED" ? industry : undefined,
      techStack: techStack ?? [],
      links: links ?? [],
      willingToPay: existing.type === "NEED" ? (willingToPay ?? false) : false,
      categories: categories ?? [],
    },
  })

  return NextResponse.json<ApiResponse<typeof post>>({ data: post, error: null })
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Post not found" },
      { status: 404 }
    )
  }

  if (existing.authorId !== user.id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Forbidden" },
      { status: 403 }
    )
  }

  await prisma.$transaction([
    prisma.vote.deleteMany({ where: { postId: params.id } }),
    prisma.comment.deleteMany({ where: { postId: params.id } }),
    prisma.post.delete({ where: { id: params.id } }),
  ])

  return NextResponse.json<ApiResponse<{ id: string }>>({ data: { id: params.id }, error: null })
}
