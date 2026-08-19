import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { query, transaction } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { created, ok } from '../../common/http/response.js'
import { requireUser } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { couponClaimSchema } from '../commerce/commerce.schemas.js'

export const benefitsRouter = Router()
benefitsRouter.use(requireUser)

benefitsRouter.get('/', asyncHandler(async (req, res) => {
  const rows = await query<RowDataPacket[]>(`SELECT uc.user_coupon_id, uc.status, uc.claimed_at, uc.used_at, uc.expires_at, c.coupon_id, c.name, c.coupon_type, c.discount_cents, c.applicable_city, c.rules_json
    FROM user_coupons uc JOIN coupons c ON c.coupon_id = uc.coupon_id WHERE uc.user_id = ? ORDER BY uc.claimed_at DESC`, [req.auth!.userId])
  return ok(res, rows)
}))

benefitsRouter.post('/claim', asyncHandler(async (req, res) => {
  const input = couponClaimSchema.parse(req.body)
  const result = await transaction(async (connection) => {
    const [coupons] = await connection.execute<RowDataPacket[]>('SELECT coupon_id, valid_days, status FROM coupons WHERE coupon_id = ? AND status = \'active\' LIMIT 1', [input.couponId])
    if (!coupons.length) throw new AppError(404, 'Coupon not found')
    const [existing] = await connection.execute<RowDataPacket[]>('SELECT user_coupon_id FROM user_coupons WHERE user_id = ? AND coupon_id = ?', [req.auth!.userId, input.couponId])
    if (existing.length) return { userCouponId: existing[0].user_coupon_id, claimed: false }
    const [insert] = await connection.execute<ResultSetHeader>('INSERT INTO user_coupons (user_id, coupon_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))', [req.auth!.userId, input.couponId, coupons[0].valid_days])
    return { userCouponId: insert.insertId, claimed: true }
  })
  return created(res, result, result.claimed ? 'Coupon claimed' : 'Coupon already claimed')
}))

benefitsRouter.post('/:userCouponId/use', asyncHandler(async (req, res) => {
  const result = await query<ResultSetHeader>('UPDATE user_coupons SET status = \'used\', used_at = NOW() WHERE user_coupon_id = ? AND user_id = ? AND status = \'available\' AND expires_at > NOW()', [req.params.userCouponId, req.auth!.userId])
  if (!result.affectedRows) throw new AppError(409, 'Coupon is unavailable or expired')
  return ok(res, { used: true })
}))
