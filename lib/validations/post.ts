import { z } from "zod"

export const createPostSchema = z.object({
  type: z.enum(["IDEA", "NEED"]),
  title: z.string().min(5).max(80),
  description: z.string().min(20).max(2000),
  stage: z.enum(["IDEA", "PROTOTYPE", "LIVE"]).optional(),
  industry: z.string().optional(),
  techStack: z.array(z.string()).max(10).optional(),
  links: z.array(z.string().url()).max(5).optional(),
  willingToPay: z.boolean().optional(),
  categories: z.array(z.string()).max(5).optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

export const updatePostSchema = z.object({
  title: z.string().min(5).max(80),
  description: z.string().min(20).max(2000),
  stage: z.enum(["IDEA", "PROTOTYPE", "LIVE"]).optional(),
  industry: z.string().optional(),
  techStack: z.array(z.string()).max(10).optional(),
  links: z.array(z.string().url()).max(5).optional(),
  willingToPay: z.boolean().optional(),
  categories: z.array(z.string()).max(5).optional(),
})

export type UpdatePostInput = z.infer<typeof updatePostSchema>
