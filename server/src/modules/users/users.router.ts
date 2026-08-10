import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { query } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { ok } from '../../common/http/response.js'
import { requireUser } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { updateProfileSchema } from './users.schemas.js'

export const usersRouter = Router()
type ProfileRow = RowDataPacket & { user_id: number; openid: string; nickname: string | null; avatar: string | null; phone: string | null; member_level: string; points: number; created_at: Date }

usersRouter.use(requireUser)
usersRouter.get('/me', asyncHandler(async (req, res) => {
  const [user] = await query<ProfileRow[]>('SELECT user_id, openid, nickname, avatar, phone, member_level, points, created_at FROM users WHERE user_id = ? AND status = 1 LIMIT 1', [req.auth!.userId])
  if (!user) throw new AppError(404, 'User not found')
  return ok(res, user)
}))
usersRouter.patch('/me', asyncHandler(async (req, res) => {
  const input = updateProfileSchema.parse(req.body)
  const fields = Object.entries(input)
  const sql = `UPDATE users SET ${fields.map(([key]) => `${key} = ?`).join(', ')} WHERE user_id = ? AND status = 1`
  const result = await query<ResultSetHeader>(sql, [...fields.map(([, value]) => value), req.auth!.userId])
  if (!result.affectedRows) throw new AppError(404, 'User not found')
  const [user] = await query<ProfileRow[]>('SELECT user_id, openid, nickname, avatar, phone, member_level, points, created_at FROM users WHERE user_id = ? LIMIT 1', [req.auth!.userId])
  return ok(res, user, 'Profile updated')
}))
