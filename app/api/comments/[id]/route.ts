import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { updateCommentSchema } from "@/lib/validations/comment"
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

  const existing = await prisma.comment.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Comment not found" },
      { status: 404 }
    )
  }

  if (existing.userId !== user.id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Forbidden" },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parsed = updateCommentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const comment = await prisma.comment.update({
    where: { id: params.id },
    data: { body: parsed.data.body },
    include: { user: true },
  })

  return NextResponse.json<ApiResponse<typeof comment>>({ data: comment, error: null })
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

  const existing = await prisma.comment.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Comment not found" },
      { status: 404 }
    )
  }

  if (existing.userId !== user.id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Forbidden" },
      { status: 403 }
    )
  }

  // Recursive delete: remove this comment and all descendant replies in one query.
  await prisma.$executeRaw`
    WITH RECURSIVE descendants AS (
      SELECT id FROM "Comment" WHERE id = ${params.id}
      UNION ALL
      SELECT c.id FROM "Comment" c
      INNER JOIN descendants d ON c."parentId" = d.id
    )
    DELETE FROM "Comment" WHERE id IN (SELECT id FROM descendants)
  `

  return NextResponse.json<ApiResponse<{ id: string }>>({ data: { id: params.id }, error: null })
}
