"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { User as DbUser } from "@/types/user"

type AuthContextValue = {
  session: Session | null
  user: User | null
  dbUser: DbUser | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  dbUser: null,
  isLoading: true,
  signOut: async () => {},
})

export function useAuthContext() {
  return useContext(AuthContext)
}

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)

  useEffect(() => {
    if (!hasSupabaseConfig) return

    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        syncDbUser()
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        syncDbUser()
      } else {
        setDbUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function syncDbUser() {
    try {
      const res = await fetch("/api/auth/sync", { method: "POST" })
      if (res.ok) {
        const { data } = await res.json()
        setDbUser(data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function signOut() {
    if (!hasSupabaseConfig) return
    const supabase = createClient()
    await supabase.auth.signOut()
    setSession(null)
    setDbUser(null)
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, dbUser, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
