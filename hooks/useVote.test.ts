import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useVote } from "./useVote"

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch)
  mockFetch.mockReset()
})

describe("useVote", () => {
  it("returns initial score and vote", () => {
    const { result } = renderHook(() =>
      useVote({ postId: "p1", initialScore: 5, initialVote: 1 })
    )

    expect(result.current.score).toBe(5)
    expect(result.current.currentVote).toBe(1)
    expect(result.current.isLoading).toBe(false)
  })

  it("increments score optimistically on upvote", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() =>
      useVote({ postId: "p1", initialScore: 5 })
    )

    await act(async () => {
      await result.current.handleVote(1)
    })

    expect(result.current.score).toBe(6)
    expect(result.current.currentVote).toBe(1)
  })

  it("decrements score optimistically on downvote", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() =>
      useVote({ postId: "p1", initialScore: 5 })
    )

    await act(async () => {
      await result.current.handleVote(-1)
    })

    expect(result.current.score).toBe(4)
    expect(result.current.currentVote).toBe(-1)
  })

  it("removes vote when clicking same direction again", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() =>
      useVote({ postId: "p1", initialScore: 5, initialVote: 1 })
    )

    await act(async () => {
      await result.current.handleVote(1)
    })

    expect(result.current.score).toBe(4)
    expect(result.current.currentVote).toBeNull()
  })

  it("swings score by 2 when changing vote direction", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() =>
      useVote({ postId: "p1", initialScore: 5, initialVote: 1 })
    )

    await act(async () => {
      await result.current.handleVote(-1)
    })

    expect(result.current.score).toBe(3)
    expect(result.current.currentVote).toBe(-1)
  })

  it("rolls back score if API call fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    const { result } = renderHook(() =>
      useVote({ postId: "p1", initialScore: 5 })
    )

    await act(async () => {
      await result.current.handleVote(1)
    })

    expect(result.current.score).toBe(5)
    expect(result.current.currentVote).toBeNull()
  })

  it("calls DELETE when removing a vote", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() =>
      useVote({ postId: "p1", initialScore: 5, initialVote: 1 })
    )

    await act(async () => {
      await result.current.handleVote(1)
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/votes", expect.objectContaining({
      method: "DELETE",
    }))
  })

  it("calls POST when casting a new vote", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() =>
      useVote({ postId: "p1", initialScore: 5 })
    )

    await act(async () => {
      await result.current.handleVote(1)
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/votes", expect.objectContaining({
      method: "POST",
    }))
  })
})
