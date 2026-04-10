import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useComments } from "./useComments"
import type { Comment } from "@/types/comment"

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch)
  mockFetch.mockReset()
})

const mockUser = {
  id: "u1",
  username: "testuser",
  email: "test@test.com",
  avatarUrl: null,
  bio: null,
  createdAt: new Date(),
}

const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: "c1",
  body: "Test comment",
  userId: "u1",
  postId: "p1",
  parentId: null,
  user: mockUser,
  replies: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe("useComments", () => {
  it("initializes with provided comments", () => {
    const initial = [makeComment()]

    const { result } = renderHook(() =>
      useComments({ postId: "p1", initialComments: initial })
    )

    expect(result.current.comments).toHaveLength(1)
    expect(result.current.commentCount).toBe(1)
  })

  it("counts nested replies in commentCount", () => {
    const initial = [
      makeComment({
        replies: [makeComment({ id: "r1" }), makeComment({ id: "r2" })],
      }),
    ]

    const { result } = renderHook(() =>
      useComments({ postId: "p1", initialComments: initial })
    )

    expect(result.current.commentCount).toBe(3)
  })

  it("adds a new comment to the top of the list", async () => {
    const newComment = makeComment({ id: "c2", body: "New comment" })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newComment }),
    })

    const { result } = renderHook(() =>
      useComments({ postId: "p1", initialComments: [makeComment()] })
    )

    await act(async () => {
      await result.current.addComment("New comment")
    })

    expect(result.current.comments).toHaveLength(2)
    expect(result.current.comments[0].id).toBe("c2")
  })

  it("adds a reply to the correct parent", async () => {
    const parent = makeComment({ id: "c1" })
    const reply = makeComment({ id: "r1", parentId: "c1", body: "A reply" })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: reply }),
    })

    const { result } = renderHook(() =>
      useComments({ postId: "p1", initialComments: [parent] })
    )

    await act(async () => {
      await result.current.addReply("A reply", "c1")
    })

    expect(result.current.comments[0].replies).toHaveLength(1)
    expect(result.current.comments[0].replies![0].id).toBe("r1")
  })

  it("sets error when addComment fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Unauthorized" }),
    })

    const { result } = renderHook(() =>
      useComments({ postId: "p1" })
    )

    await act(async () => {
      const comment = await result.current.addComment("test")
      expect(comment).toBeNull()
    })

    expect(result.current.error).toBe("Unauthorized")
  })

  it("fetches comments from API", async () => {
    const fetched = [makeComment({ id: "fetched" })]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: fetched }),
    })

    const { result } = renderHook(() =>
      useComments({ postId: "p1" })
    )

    await act(async () => {
      await result.current.fetchComments()
    })

    expect(result.current.comments).toHaveLength(1)
    expect(result.current.comments[0].id).toBe("fetched")
    expect(mockFetch).toHaveBeenCalledWith("/api/comments?postId=p1")
  })
})
