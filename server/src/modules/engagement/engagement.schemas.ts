import { z } from 'zod'

export const postListSchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(50).default(20) })
export const createPostSchema = z.object({ content: z.string().trim().min(1).max(5000), imageUrls: z.array(z.string().max(700)).max(9).default([]), tags: z.array(z.string().max(50)).max(10).default([]) })
export const commentSchema = z.object({ content: z.string().trim().min(1).max(1000) })
export const reactionSchema = z.object({ type: z.enum(['like', 'favorite']) })
export const repairSchema = z.object({ vehicleIdentifier: z.string().trim().min(1).max(50), vehicleId: z.coerce.number().int().positive().optional(), issueTypes: z.array(z.string().trim().min(1).max(50)).min(1).max(10), description: z.string().max(3000).optional(), contactPhone: z.string().regex(/^1\d{10}$/), photoUrls: z.array(z.string().max(700)).max(3).default([]) })
export const supportMessageSchema = z.object({ content: z.string().trim().min(1).max(2000) })
