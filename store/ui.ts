import { create } from "zustand"
import type { PostType } from "@/types/post"

type AuthModalView = "login" | "signup" | null

type UiState = {
  feedFilter: PostType | "ALL"
  isPostModalOpen: boolean
  authModalView: AuthModalView
  setFeedFilter: (filter: PostType | "ALL") => void
  openPostModal: () => void
  closePostModal: () => void
  openAuthModal: (view: "login" | "signup") => void
  closeAuthModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  feedFilter: "ALL",
  isPostModalOpen: false,
  authModalView: null,
  setFeedFilter: (feedFilter) => set({ feedFilter }),
  openPostModal: () => set({ isPostModalOpen: true }),
  closePostModal: () => set({ isPostModalOpen: false }),
  openAuthModal: (view) => set({ authModalView: view }),
  closeAuthModal: () => set({ authModalView: null }),
}))
