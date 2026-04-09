import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useFeed } from "./useFeed"
import { FEED_PAGE_SIZE } from "@/lib/utils/constants"
import type { Post } from "@/types/post"
import type { User } from "@/types/user"

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch)
  mockFetch.mockReset()
})

const mockAuthor: User = {
  id: "u1",
  username: "testuser",
  email: "test@test.com",
  avatarUrl: null,
  bio: null,
  createdAt: new Date(),
}

function makePosts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    type: "IDEA" as const,
    title: `Post ${i}`,
    description: `Description ${i}`,
    stage: "IDEA" as const,
    industry: null,
    techStack: [],
    links: [],
    mediaUrls: [],
    willingToPay: false,
    status: "OPEN" as const,
    score: 0,
    authorId: "u1",
    categories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockAuthor,
    _count: { comments: 0 },
  }))
}

describe("useFeed", () => {
  it("initializes with provided posts", () => {
    const posts = makePosts(3)
    const { result } = renderHook(() =>
      useFeed({ initialPosts: posts })
    )

    expect(result.current.posts).toHaveLength(3)
    expect(result.current.sort).toBe("top")
  })

  it("sets hasMore to false when initial posts are fewer than page size", () => {
    const posts = makePosts(5)
    const { result } = renderHook(() =>
      useFeed({ initialPosts: posts })
    )

    expect(result.current.hasMore).toBe(false)
  })

  it("sets hasMore to true when initial posts fill a page", () => {
    const posts = makePosts(FEED_PAGE_SIZE)
    const { result } = renderHook(() =>
      useFeed({ initialPosts: posts })
    )

    expect(result.current.hasMore).toBe(true)
  })

  it("appends new posts on loadMore", async () => {
    const initial = makePosts(FEED_PAGE_SIZE)
    const morePosts = makePosts(5)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: morePosts }),
    })

    const { result } = renderHook(() =>
      useFeed({ initialPosts: initial })
    )

    await act(async () => {
      await result.current.loadMore()
    })

    expect(result.current.posts).toHaveLength(FEED_PAGE_SIZE + 5)
    expect(result.current.hasMore).toBe(false)
  })

  it("does not load more when hasMore is false", async () => {
    const { result } = renderHook(() =>
      useFeed({ initialPosts: makePosts(3) })
    )

    await act(async () => {
      await result.current.loadMore()
    })

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("passes type filter in the query params", async () => {
    const initial = makePosts(FEED_PAGE_SIZE)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    })

    const { result } = renderHook(() =>
      useFeed({ initialPosts: initial, type: "IDEA" })
    )

    await act(async () => {
      await result.current.loadMore()
    })

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain("type=IDEA")
  })

  it("changes sort value", () => {
    const { result } = renderHook(() =>
      useFeed({ initialPosts: [] })
    )

    act(() => {
      result.current.changeSort("new")
    })

    expect(result.current.sort).toBe("new")
  })
})
