import { z } from "zod"

export const createCommentSchema = z.object({
  postId: z.string().cuid(),
  body: z.string().min(1).max(1000),
  parentId: z.string().cuid().optional(),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
