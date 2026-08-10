import { Router } from 'express'
import { z } from 'zod'
import { fail, ok } from '../lib/response.js'

export const bookingsRouter = Router()
const schema = z.object({ destinationId: z.coerce.number().int().positive(), name: z.string().trim().min(1).max(30), phone: z.string().regex(/^1\d{10}$/), date: z.string().min(8), people: z.coerce.number().int().min(1).max(20), note: z.string().max(200).optional().default('') })

bookingsRouter.post('/', (req, res) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return fail(res, 400, '预约信息不完整', parsed.error.flatten())
  // Replace this ID generation with an INSERT result after enabling MySQL.
  return ok(res, { id: Date.now(), status: 'pending', ...parsed.data }, '预约提交成功')
})
