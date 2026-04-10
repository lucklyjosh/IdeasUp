import type { User } from "./user"

export type Comment = {
  id: string
  body: string
  userId: string
  postId: string
  parentId: string | null
  user: User
  replies?: Comment[]
  createdAt: Date
  updatedAt: Date
}
