"use client"

import { useState, useCallback } from "react"
import type { Post, PostType } from "@/types/post"
import type { User } from "@/types/user"
import { FEED_PAGE_SIZE } from "@/lib/utils/constants"

type FeedPost = Post & {
  author: User
  _count: { comments: number }
}

type SortOption = "top" | "new"

type UseFeedOptions = {
  initialPosts: FeedPost[]
  type?: PostType | "ALL"
  sort?: SortOption
}

export function useFeed({ initialPosts, type = "ALL", sort: initialSort = "top" }: UseFeedOptions) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts)
  const [sort, setSort] = useState<SortOption>(initialSort)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= FEED_PAGE_SIZE)

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)

    try {
      const params = new URLSearchParams({
        cursor: posts[posts.length - 1]?.id ?? "",
        sort,
      })
      if (type !== "ALL") {
        params.set("type", type)
      }

      const res = await fetch(`/api/posts?${params}`)
      if (!res.ok) throw new Error("Failed to load posts")

      const { data } = await res.json()
      const newPosts = data ?? []

      setPosts((prev) => [...prev, ...newPosts])
      setHasMore(newPosts.length >= FEED_PAGE_SIZE)
    } catch {
      // Silently fail — user can retry
    } finally {
      setIsLoadingMore(false)
    }
  }, [posts, sort, type, isLoadingMore, hasMore])

  const changeSort = useCallback((newSort: SortOption) => {
    setSort(newSort)
    // Sort change requires a full reload from the server
    // The parent page should re-fetch via navigation
  }, [])

  return {
    posts,
    sort,
    isLoadingMore,
    hasMore,
    loadMore,
    changeSort,
  }
}
