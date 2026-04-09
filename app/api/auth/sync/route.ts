import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncUser } from "@/lib/auth/sync-user"
import type { ApiResponse } from "@/types/post"

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const dbUser = await syncUser(user)

  return NextResponse.json<ApiResponse<typeof dbUser>>({ data: dbUser, error: null })
}
