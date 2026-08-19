import { z } from 'zod'

export const demoLoginSchema = z.object({
  openid: z.string().trim().min(3).max(100),
  nickname: z.string().trim().min(1).max(50).optional(),
  avatar: z.string().url().max(255).optional(),
  phone: z.string().regex(/^1\d{10}$/).optional()
})

export const wechatLoginSchema = z.object({
  code: z.string().trim().min(1).max(512),
  nickname: z.string().trim().min(1).max(50).optional(),
  avatar: z.string().url().max(255).optional(),
  phone: z.string().regex(/^1\d{10}$/).optional()
})

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(10).max(128)
})
