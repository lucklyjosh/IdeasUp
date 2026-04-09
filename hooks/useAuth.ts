"use client"

import { useAuthContext } from "@/components/providers/AuthProvider"

export function useAuth() {
  const { session, user, dbUser, isLoading, signOut } = useAuthContext()

  const isAuthenticated = !!session && !!user
  const userId = dbUser?.id ?? null
  const username = dbUser?.username ?? null

  return {
    session,
    user,
    dbUser,
    isLoading,
    isAuthenticated,
    userId,
    username,
    signOut,
  }
}
