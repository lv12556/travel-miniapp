import { Router } from 'express'
import { pool } from '../../config/database.js'
import { ok } from '../../common/http/response.js'
import { asyncHandler } from '../../common/utils/async-handler.js'

export const healthRouter = Router()

healthRouter.get('/', asyncHandler(async (_req, res) => {
  await pool.query('SELECT 1')
  return ok(res, { status: 'up', database: 'connected', timestamp: new Date().toISOString() })
}))

healthRouter.get('/ready', asyncHandler(async (_req, res) => {
  await pool.query('SELECT COUNT(*) AS users FROM users')
  await pool.query('SELECT COUNT(*) AS vehicles FROM vehicles')
  return ok(res, { status: 'ready', database: 'tuneng_db', timestamp: new Date().toISOString() })
}))
