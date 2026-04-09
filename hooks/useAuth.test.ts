import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

const mockAuthContext = {
  session: null,
  user: null,
  dbUser: null,
  isLoading: false,
  signOut: vi.fn(),
}

vi.mock("@/components/providers/AuthProvider", () => ({
  useAuthContext: () => mockAuthContext,
}))

import { useAuth } from "./useAuth"

describe("useAuth", () => {
  it("returns isAuthenticated false when no session", () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.userId).toBeNull()
    expect(result.current.username).toBeNull()
  })

  it("returns isAuthenticated true when session exists", () => {
    mockAuthContext.session = { access_token: "t", user: { id: "u1" } } as never
    mockAuthContext.user = { id: "u1" } as never
    mockAuthContext.dbUser = {
      id: "db1",
      username: "testuser",
      email: "test@test.com",
      avatarUrl: null,
      bio: null,
      createdAt: new Date(),
    } as never

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.userId).toBe("db1")
    expect(result.current.username).toBe("testuser")
  })

  it("exposes signOut function", () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.signOut).toBe(mockAuthContext.signOut)
  })
})
