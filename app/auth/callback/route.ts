import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncUser } from "@/lib/auth/sync-user"

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Sync user to Prisma DB on OAuth callback
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await syncUser(user)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
