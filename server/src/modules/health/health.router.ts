import { Router } from 'express'
import { pool } from '../../config/database.js'
import { ok } from '../../common/http/response.js'
import { asyncHandler } from '../../common/utils/async-handler.js'

export const healthRouter = Router()

healthRouter.get('/', asyncHandler(async (_req, res) => {
  await pool.query('SELECT 1')
  return ok(res, { status: 'up', database: 'connected', timestamp: new Date().toISOString() })
}))
