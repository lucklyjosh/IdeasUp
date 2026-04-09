export type PostType = "IDEA" | "NEED"
export type Stage = "IDEA" | "PROTOTYPE" | "LIVE"
export type NeedStatus = "OPEN" | "IN_PROGRESS" | "DONE"

export type Post = {
  id: string
  type: PostType
  title: string
  description: string
  stage: Stage | null
  industry: string | null
  techStack: string[]
  links: string[]
  mediaUrls: string[]
  willingToPay: boolean
  status: NeedStatus
  score: number
  authorId: string
  categories: string[]
  createdAt: Date
  updatedAt: Date
}

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}
