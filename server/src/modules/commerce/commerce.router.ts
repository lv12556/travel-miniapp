import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { query, transaction } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { created, ok } from '../../common/http/response.js'
import { requireUser } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { addressSchema, createOrderSchema, productQuerySchema } from './commerce.schemas.js'

export const commerceRouter = Router()

commerceRouter.get('/products', asyncHandler(async (req, res) => {
  const input = productQuerySchema.parse(req.query)
  const offset = (input.page - 1) * input.pageSize
  const where = input.type ? 'WHERE status = \'active\' AND product_type = ?' : 'WHERE status = \'active\''
  const values = input.type ? [input.type, input.pageSize, offset] : [input.pageSize, offset]
  const rows = await query<RowDataPacket[]>(`SELECT product_id, product_type, name, description, price_cents, points_price, image_url FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, values)
  const [count] = await query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM products ${where}`, input.type ? [input.type] : [])
  return ok(res, { items: rows, page: input.page, pageSize: input.pageSize, total: Number(count.total) })
}))

commerceRouter.get('/products/:productId', asyncHandler(async (req, res) => {
  const [product] = await query<RowDataPacket[]>('SELECT product_id, product_type, name, description, price_cents, points_price, image_url FROM products WHERE product_id = ? AND status = \'active\' LIMIT 1', [req.params.productId])
  if (!product) throw new AppError(404, 'Product not found')
  return ok(res, product)
}))

commerceRouter.use(requireUser)

commerceRouter.get('/addresses', asyncHandler(async (req, res) => {
  const rows = await query<RowDataPacket[]>('SELECT address_id, receiver_name, phone, province, city, district, detail_address, is_default, created_at FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC', [req.auth!.userId])
  return ok(res, rows)
}))

commerceRouter.post('/addresses', asyncHandler(async (req, res) => {
  const input = addressSchema.parse(req.body)
  const address = await transaction(async (connection) => {
    if (input.isDefault) await connection.execute('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.auth!.userId])
    const [result] = await connection.execute<ResultSetHeader>('INSERT INTO user_addresses (user_id, receiver_name, phone, province, city, district, detail_address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.auth!.userId, input.receiverName, input.phone, input.province, input.city, input.district ?? null, input.detailAddress, input.isDefault ? 1 : 0])
    return result.insertId
  })
  return created(res, { addressId: address }, 'Address saved')
}))

commerceRouter.get('/orders', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1)); const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20))); const offset = (page - 1) * pageSize
  const rows = await query<RowDataPacket[]>('SELECT order_id, order_no, order_type, status, total_cents, points_used, address_id, created_at, updated_at FROM commerce_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [req.auth!.userId, pageSize, offset])
  const [count] = await query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM commerce_orders WHERE user_id = ?', [req.auth!.userId])
  return ok(res, { items: rows, page, pageSize, total: Number(count.total) })
}))

commerceRouter.post('/orders', asyncHandler(async (req, res) => {
  const input = createOrderSchema.parse(req.body)
  const result = await transaction(async (connection) => {
    const total = input.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0)
    if (input.addressId) {
      const [addresses] = await connection.execute<RowDataPacket[]>('SELECT address_id FROM user_addresses WHERE address_id = ? AND user_id = ?', [input.addressId, req.auth!.userId])
      if (!addresses.length) throw new AppError(400, 'Address does not belong to current user')
    }
    if (input.pointsUsed > 0) {
      const [users] = await connection.execute<RowDataPacket[]>('SELECT points FROM users WHERE user_id = ? FOR UPDATE', [req.auth!.userId])
      if (!users[0] || Number(users[0].points) < input.pointsUsed) throw new AppError(400, 'Insufficient points')
      await connection.execute('UPDATE users SET points = points - ? WHERE user_id = ?', [input.pointsUsed, req.auth!.userId])
      await connection.execute('INSERT INTO points_transactions (user_id, amount, type, description) VALUES (?, ?, \'spend\', ?)', [req.auth!.userId, -input.pointsUsed, '商城订单积分抵扣'])
    }
    const orderNo = `TN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    const [order] = await connection.execute<ResultSetHeader>('INSERT INTO commerce_orders (order_no, user_id, order_type, status, total_cents, points_used, address_id, remark) VALUES (?, ?, ?, \'pending_payment\', ?, ?, ?, ?)', [orderNo, req.auth!.userId, input.orderType, total, input.pointsUsed, input.addressId ?? null, input.remark ?? null])
    for (const item of input.items) await connection.execute('INSERT INTO commerce_order_items (order_id, product_id, product_name, sku_label, quantity, unit_price_cents, points_price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [order.insertId, item.productId ?? null, item.productName, item.skuLabel ?? null, item.quantity, item.unitPriceCents, item.pointsPrice ?? null, item.imageUrl ?? null])
    return { orderId: order.insertId, orderNo, totalCents: total, status: 'pending_payment' }
  })
  return created(res, result, 'Order created')
}))

commerceRouter.get('/orders/:orderId', asyncHandler(async (req, res) => {
  const [order] = await query<RowDataPacket[]>('SELECT order_id, order_no, order_type, status, total_cents, points_used, address_id, remark, created_at, updated_at FROM commerce_orders WHERE order_id = ? AND user_id = ? LIMIT 1', [req.params.orderId, req.auth!.userId])
  if (!order) throw new AppError(404, 'Order not found')
  const items = await query<RowDataPacket[]>('SELECT item_id, product_id, product_name, sku_label, quantity, unit_price_cents, points_price, image_url FROM commerce_order_items WHERE order_id = ?', [order.order_id])
  return ok(res, { ...order, items })
}))

commerceRouter.post('/orders/:orderId/payments/wechat', asyncHandler(async (req, res) => {
  const [order] = await query<RowDataPacket[]>('SELECT order_id, order_no, total_cents, status FROM commerce_orders WHERE order_id = ? AND user_id = ? LIMIT 1', [req.params.orderId, req.auth!.userId])
  if (!order) throw new AppError(404, 'Order not found')
  if (order.status !== 'pending_payment') throw new AppError(409, 'Order is not payable')
  const payment = await query<ResultSetHeader>('INSERT INTO order_payments (order_id, provider, amount_cents) VALUES (?, \'wechat\', ? ) ON DUPLICATE KEY UPDATE amount_cents = VALUES(amount_cents)', [order.order_id, order.total_cents])
  return ok(res, { orderId: order.order_id, orderNo: order.order_no, paymentId: payment.insertId || null, status: 'pending', message: 'WeChat prepay parameters will be returned after merchant credentials are configured' })
}))
