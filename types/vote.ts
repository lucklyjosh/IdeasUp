export type Vote = {
  id: string
  value: 1 | -1
  userId: string
  postId: string
  createdAt: Date
}
