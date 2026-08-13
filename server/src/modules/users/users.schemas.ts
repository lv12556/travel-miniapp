import { z } from 'zod'

export const updateProfileSchema = z.object({
  nickname: z.string().trim().min(1).max(50).optional(),
  avatar: z.string().url().max(255).nullable().optional(),
  phone: z.string().regex(/^1\d{10}$/).nullable().optional()
}).refine((value) => Object.keys(value).length > 0, 'At least one field is required')
