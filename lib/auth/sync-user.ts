import { prisma } from "@/lib/prisma"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export async function syncUser(supabaseUser: SupabaseUser) {
  const existing = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  })

  if (existing) return existing

  const meta = supabaseUser.user_metadata
  const email = supabaseUser.email ?? ""

  // Derive username from OAuth metadata or email prefix
  const rawUsername =
    meta?.user_name ??
    meta?.preferred_username ??
    meta?.name ??
    email.split("@")[0] ??
    "user"

  // Ensure uniqueness by appending random suffix if taken
  let username = rawUsername.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30)
  const taken = await prisma.user.findUnique({ where: { username } })
  if (taken) {
    username = `${username}-${Math.random().toString(36).slice(2, 6)}`
  }

  return prisma.user.create({
    data: {
      id: supabaseUser.id,
      email,
      username,
      avatarUrl: meta?.avatar_url ?? meta?.picture ?? null,
      bio: null,
    },
  })
}
