import { Router } from 'express'
import type { RowDataPacket } from 'mysql2'
import { query } from '../../config/database.js'
import { ok } from '../../common/http/response.js'
import { requireUser } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { paginationSchema } from '../trips/trips.schemas.js'

export const pointsRouter = Router()
pointsRouter.use(requireUser)
pointsRouter.get('/summary', asyncHandler(async (req, res) => {
  const [row] = await query<(RowDataPacket & { points: number; member_level: string })[]>('SELECT points, member_level FROM users WHERE user_id = ? LIMIT 1', [req.auth!.userId])
  return ok(res, row)
}))
pointsRouter.get('/transactions', asyncHandler(async (req, res) => {
  const input = paginationSchema.parse(req.query)
  const offset = (input.page - 1) * input.pageSize
  const rows = await query<RowDataPacket[]>('SELECT id, amount, type, description, created_at FROM points_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [req.auth!.userId, input.pageSize, offset])
  return ok(res, { items: rows, page: input.page, pageSize: input.pageSize })
}))
