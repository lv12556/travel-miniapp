import { Router } from 'express'
import { env } from '../../config/env.js'
import { query } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { created, ok } from '../../common/http/response.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { createAccessToken, requireUser } from '../../common/middleware/auth.js'
import { demoLoginSchema, wechatLoginSchema } from './auth.schemas.js'
import type { RowDataPacket } from 'mysql2'

export const authRouter = Router()

type UserRow = RowDataPacket & { user_id: number; openid: string; nickname: string | null; avatar: string | null; phone: string | null; member_level: string; points: number }

/**
 * Development login. In production, replace the supplied openid with the result
 * of WeChat code2Session before this upsert is performed.
 */
authRouter.post('/mini-program-login', asyncHandler(async (req, res) => {
  if (!env.ALLOW_DEMO_LOGIN) {
    if (!env.WECHAT_APPID || !env.WECHAT_APPSECRET) throw new AppError(503, 'WeChat login is not configured')
    const input = wechatLoginSchema.parse(req.body)
    const response = await fetch(`https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(env.WECHAT_APPID)}&secret=${encodeURIComponent(env.WECHAT_APPSECRET)}&js_code=${encodeURIComponent(input.code)}&grant_type=authorization_code`)
    const payload = await response.json() as { openid?: string; session_key?: string; errcode?: number; errmsg?: string }
    if (!response.ok || !payload.openid) throw new AppError(401, payload.errmsg || 'WeChat login failed')
    await query(`INSERT INTO users (openid, nickname, avatar, phone) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nickname = COALESCE(VALUES(nickname), nickname), avatar = COALESCE(VALUES(avatar), avatar), phone = COALESCE(VALUES(phone), phone)`, [payload.openid, input.nickname ?? null, input.avatar ?? null, input.phone ?? null])
    const [user] = await query<UserRow[]>('SELECT user_id, openid, nickname, avatar, phone, member_level, points FROM users WHERE openid = ? AND status = 1 LIMIT 1', [payload.openid])
    if (!user) throw new AppError(403, 'User is disabled')
    return created(res, { accessToken: createAccessToken({ userId: user.user_id, openid: user.openid }), user }, 'Login successful')
  }
  const input = demoLoginSchema.parse(req.body)
  await query(
    `INSERT INTO users (openid, nickname, avatar, phone)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nickname = COALESCE(VALUES(nickname), nickname), avatar = COALESCE(VALUES(avatar), avatar), phone = COALESCE(VALUES(phone), phone)`,
    [input.openid, input.nickname ?? null, input.avatar ?? null, input.phone ?? null]
  )
  const [user] = await query<UserRow[]>('SELECT user_id, openid, nickname, avatar, phone, member_level, points FROM users WHERE openid = ? AND status = 1 LIMIT 1', [input.openid])
  if (!user) throw new AppError(403, 'User is disabled')
  return created(res, { accessToken: createAccessToken({ userId: user.user_id, openid: user.openid }), user }, 'Login successful')
}))

authRouter.post('/refresh-token', requireUser, asyncHandler(async (req, res) => {
  const [user] = await query<UserRow[]>('SELECT user_id, openid FROM users WHERE user_id = ? AND status = 1 LIMIT 1', [req.auth!.userId])
  if (!user) throw new AppError(404, 'User not found')
  return ok(res, { accessToken: createAccessToken({ userId: user.user_id, openid: user.openid }) })
}))
