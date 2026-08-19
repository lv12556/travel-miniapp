import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { query } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { ok } from '../../common/http/response.js'
import { requireUser } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'

export const notificationsRouter = Router()
notificationsRouter.use(requireUser)

notificationsRouter.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1)); const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 20))); const offset = (page - 1) * pageSize
  const rows = await query<RowDataPacket[]>('SELECT notification_id, notification_type, title, summary, detail, payload_json, is_read, created_at FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?', [req.auth!.userId, pageSize, offset])
  const [count] = await query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0', [req.auth!.userId])
  return ok(res, { items: rows, page, pageSize, unread: Number(count.total) })
}))

notificationsRouter.get('/unread-count', asyncHandler(async (req, res) => {
  const [count] = await query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0', [req.auth!.userId])
  return ok(res, { unread: Number(count.total) })
}))

notificationsRouter.patch('/read-all', asyncHandler(async (req, res) => {
  await query<ResultSetHeader>('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL', [req.auth!.userId])
  return ok(res, { updated: true })
}))

notificationsRouter.patch('/:notificationId/read', asyncHandler(async (req, res) => {
  const result = await query<ResultSetHeader>('UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND (user_id = ? OR user_id IS NULL)', [req.params.notificationId, req.auth!.userId])
  if (!result.affectedRows) throw new AppError(404, 'Notification not found')
  return ok(res, { updated: true })
}))
