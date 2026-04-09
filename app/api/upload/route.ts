import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAcceptedImageType, isAcceptedVideoType, isWithinSizeLimit } from "@/lib/utils/upload"
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

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "No file provided" },
      { status: 400 }
    )
  }

  if (!isAcceptedImageType(file.type) && !isAcceptedVideoType(file.type)) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unsupported file type" },
      { status: 400 }
    )
  }

  if (!isWithinSizeLimit(file)) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "File too large" },
      { status: 400 }
    )
  }

  const ext = file.name.split(".").pop() ?? "bin"
  const path = `${user.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file)

  if (uploadError) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Upload failed" },
      { status: 500 }
    )
  }

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(path)

  return NextResponse.json<ApiResponse<{ url: string }>>(
    { data: { url: urlData.publicUrl }, error: null },
    { status: 201 }
  )
}
