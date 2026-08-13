import jwt from 'jsonwebtoken'
import type { RequestHandler } from 'express'
import { env } from '../../config/env.js'
import { AppError } from '../errors/app-error.js'

type TokenPayload = { userId: number; openid: string }

export function createAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
}

export const requireUser: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return next(new AppError(401, 'Missing access token'))
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload
    req.auth = payload
    return next()
  } catch {
    return next(new AppError(401, 'Invalid or expired access token'))
  }
}
