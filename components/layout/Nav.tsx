"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthContext } from "@/components/providers/AuthProvider"
import { useUiStore } from "@/store/ui"
import { cn } from "@/lib/utils/cn"

const NAV_LINKS = [
  { href: "/ideas", label: "Ideas" },
  { href: "/needs", label: "Needs" },
]

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, dbUser, isLoading, signOut } = useAuthContext()
  const { openAuthModal } = useUiStore()

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b glass">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5 font-semibold tracking-tight text-zinc-900">
            <svg className="h-5 w-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            IdeasUp
          </Link>
          <nav className="flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && (
            <>
              {user ? (
                <Link
                  href="/post"
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-violet-500 active:scale-[0.97]"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Post
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-violet-500 active:scale-[0.97]"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Post
                </button>
              )}

              {user ? (
                <>
                  <Link
                    href={`/profile/${dbUser?.username ?? ""}`}
                    className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-600"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal("login")}
                    className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-600"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.97]"
                  >
                    Sign up
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
