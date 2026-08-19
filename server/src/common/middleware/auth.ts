import jwt from 'jsonwebtoken'
import type { RequestHandler } from 'express'
import { env } from '../../config/env.js'
import { AppError } from '../errors/app-error.js'

type UserTokenPayload = { userId: number; openid: string; adminId?: never; role?: never }
type AdminTokenPayload = { userId: 0; openid: string; adminId: number; role: 'super_admin' | 'editor' }
type TokenPayload = UserTokenPayload | AdminTokenPayload

export function createAccessToken(payload: UserTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
}

export function createAdminAccessToken(payload: Omit<AdminTokenPayload, 'userId'>) {
  return jwt.sign({ ...payload, userId: 0 }, env.JWT_SECRET, { expiresIn: '8h' })
}

export const requireUser: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return next(new AppError(401, 'Missing access token'))
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload
    if (payload.adminId) return next(new AppError(403, 'Administrator token cannot access user API'))
    req.auth = payload
    return next()
  } catch {
    return next(new AppError(401, 'Invalid or expired access token'))
  }
}

export const requireAdmin = (...allowedRoles: Array<AdminTokenPayload['role']>): RequestHandler => (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return next(new AppError(401, 'Missing administrator access token'))
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload
    if (!payload.adminId || !payload.role || (allowedRoles.length && !allowedRoles.includes(payload.role))) {
      return next(new AppError(403, 'Administrator permission required'))
    }
    req.auth = payload
    return next()
  } catch {
    return next(new AppError(401, 'Invalid or expired administrator token'))
  }
}
