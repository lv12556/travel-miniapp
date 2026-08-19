import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { query } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { created, ok } from '../../common/http/response.js'
import { requireAdmin } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { adminCreateSchema, adminPaginationSchema, adminStatusSchema, merchantUpdateSchema, orderStatusSchema, postStatusSchema, productUpdateSchema, repairUpdateSchema, stationSchema, stationUpdateSchema, vehicleCreateSchema, vehicleUpdateSchema } from './admin.schemas.js'
import { hashPassword } from './admin.service.js'

export const adminRouter = Router()
adminRouter.use(requireAdmin())

adminRouter.get('/admins', requireAdmin('super_admin'), asyncHandler(async (_req, res) => {
  const rows = await query<RowDataPacket[]>('SELECT admin_id, username, role, status, created_at FROM admins ORDER BY admin_id ASC')
  return ok(res, rows)
}))

adminRouter.post('/admins', requireAdmin('super_admin'), asyncHandler(async (req, res) => {
  const input = adminCreateSchema.parse(req.body)
  const passwordHash = await hashPassword(input.password)
  try {
    const result = await query<ResultSetHeader>('INSERT INTO admins (username, password_hash, role, status) VALUES (?, ?, ?, 1)', [input.username, passwordHash, input.role])
    return created(res, { adminId: result.insertId, username: input.username, role: input.role }, 'Administrator created')
  } catch (error) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new AppError(409, 'Administrator username already exists')
    throw error
  }
}))

adminRouter.patch('/admins/:adminId/status', requireAdmin('super_admin'), asyncHandler(async (req, res) => {
  const input = adminStatusSchema.parse(req.body)
  if (Number(req.params.adminId) === req.auth!.adminId && input.status === 0) throw new AppError(400, 'You cannot disable the current administrator')
  const result = await query<ResultSetHeader>('UPDATE admins SET status = ? WHERE admin_id = ?', [input.status, req.params.adminId])
  if (!result.affectedRows) throw new AppError(404, 'Administrator not found')
  return ok(res, { adminId: Number(req.params.adminId), status: input.status }, 'Administrator status updated')
}))

const list = async <T extends RowDataPacket>(sql: string, countSql: string, input: { page: number; pageSize: number }, params: unknown[] = []) => {
  const offset = (input.page - 1) * input.pageSize
  const rows = await query<T[]>(`${sql} LIMIT ? OFFSET ?`, [...params, input.pageSize, offset])
  const [count] = await query<(RowDataPacket & { total: number })[]>(countSql, params)
  return { items: rows, page: input.page, pageSize: input.pageSize, total: Number(count.total) }
}

adminRouter.get('/users', asyncHandler(async (req, res) => {
  const input = adminPaginationSchema.parse(req.query); const clauses = ['1 = 1']; const params: unknown[] = []
  if (input.keyword) { clauses.push('(u.nickname LIKE ? OR u.phone LIKE ?)'); params.push(`%${input.keyword}%`, `%${input.keyword}%`) }
  if (input.status) { clauses.push('u.status = ?'); params.push(Number(input.status)) }
  const where = clauses.join(' AND ')
  return ok(res, await list<RowDataPacket>(`SELECT u.user_id, u.nickname, u.avatar, u.phone, u.member_level, u.points, u.status, u.created_at FROM users u WHERE ${where} ORDER BY u.created_at DESC`, `SELECT COUNT(*) AS total FROM users u WHERE ${where}`, input, params))
}))

adminRouter.patch('/users/:userId/status', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = adminStatusSchema.parse(req.body); const result = await query<ResultSetHeader>('UPDATE users SET status = ? WHERE user_id = ?', [input.status, req.params.userId]); if (!result.affectedRows) throw new AppError(404, 'User not found'); return ok(res, { userId: Number(req.params.userId), status: input.status }, 'User status updated')
}))

adminRouter.get('/merchants', asyncHandler(async (req, res) => {
  const input = adminPaginationSchema.parse(req.query); const clauses = ['1 = 1']; const params: unknown[] = []
  if (input.keyword) { clauses.push('(m.name LIKE ? OR m.contact_name LIKE ?)'); params.push(`%${input.keyword}%`, `%${input.keyword}%`) }
  if (input.status) { clauses.push('m.status = ?'); params.push(input.status) }
  const where = clauses.join(' AND ')
  return ok(res, await list<RowDataPacket>(`SELECT m.merchant_id, m.name, m.merchant_type, m.contact_name, m.contact_phone, m.status, m.cooperation_summary, m.created_at FROM merchants m WHERE ${where} ORDER BY m.created_at DESC`, `SELECT COUNT(*) AS total FROM merchants m WHERE ${where}`, input, params))
}))

adminRouter.patch('/merchants/:merchantId', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = merchantUpdateSchema.parse(req.body); const mapping: Record<string, string> = { merchantType: 'merchant_type', contactName: 'contact_name', contactPhone: 'contact_phone', cooperationSummary: 'cooperation_summary' }; const fields = Object.keys(input).map((key) => `${mapping[key] || key} = ?`); const result = await query<ResultSetHeader>(`UPDATE merchants SET ${fields.join(', ')} WHERE merchant_id = ?`, [...Object.values(input), req.params.merchantId]); if (!result.affectedRows) throw new AppError(404, 'Merchant not found'); return ok(res, { merchantId: Number(req.params.merchantId) }, 'Merchant updated')
}))

adminRouter.get('/dashboard', asyncHandler(async (_req, res) => {
  const [users, vehicles, onlineVehicles, stations, products, rentalOrders, commerceOrders, todayRentalOrders, todayCommerceOrders, todayRentalRevenue, pendingOrders, pendingRepairs, pendingPosts, pendingMerchants, orderTrend, vehicleStatus, stationAvailability] = await Promise.all([
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM users WHERE status = 1'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM vehicles'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM vehicles WHERE status IN (\'available\', \'in_use\')'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM parking_zones WHERE status = 1'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM products WHERE status = \'active\''),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM rental_orders'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM commerce_orders'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM rental_orders WHERE DATE(start_time) = CURDATE()'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM commerce_orders WHERE DATE(created_at) = CURDATE()'),
    query<(RowDataPacket & { total: number })[]>('SELECT COALESCE(SUM(total_cents), 0) AS total FROM commerce_orders WHERE DATE(created_at) = CURDATE() AND status IN (\'paid\', \'shipped\', \'completed\')'),
    query<(RowDataPacket & { total: number })[]>('SELECT (SELECT COUNT(*) FROM commerce_orders WHERE status = \'pending_payment\') + (SELECT COUNT(*) FROM rental_orders WHERE status = \'ongoing\') AS total'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM repair_tickets WHERE status IN (\'submitted\', \'processing\')'),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM community_posts WHERE status = \'hidden\''),
    query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM merchants WHERE status = \'pending\''),
    query<RowDataPacket[]>(`SELECT day_label AS label, SUM(order_count) AS value FROM (
      SELECT DATE_FORMAT(start_time, '%m-%d') AS day_label, COUNT(*) AS order_count FROM rental_orders WHERE start_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(start_time)
      UNION ALL
      SELECT DATE_FORMAT(created_at, '%m-%d') AS day_label, COUNT(*) AS order_count FROM commerce_orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at)
    ) daily_orders GROUP BY day_label ORDER BY day_label`),
    query<RowDataPacket[]>('SELECT status AS label, COUNT(*) AS value FROM vehicles GROUP BY status ORDER BY value DESC'),
    query<RowDataPacket[]>(`SELECT p.zone_name AS label, SUM(CASE WHEN v.status = 'available' THEN 1 ELSE 0 END) AS value
      FROM parking_zones p LEFT JOIN vehicles v ON v.current_lat IS NOT NULL AND v.current_lng IS NOT NULL
      GROUP BY p.zone_id ORDER BY value DESC, p.zone_id ASC LIMIT 6`)
  ])
  return ok(res, { todayOrders: Number(todayRentalOrders[0].total) + Number(todayCommerceOrders[0].total), todayRevenueCents: Number(todayRentalRevenue[0].total), users: users[0].total, stations: stations[0].total, vehicles: vehicles[0].total, onlineVehicles: onlineVehicles[0].total, products: products[0].total, rentalOrders: rentalOrders[0].total, commerceOrders: commerceOrders[0].total, pendingOrders: Number(pendingOrders[0].total), pendingRepairs: pendingRepairs[0].total, hiddenPosts: pendingPosts[0].total, pendingMerchants: Number(pendingMerchants[0].total), orderTrend, vehicleStatus, stationAvailability })
}))

adminRouter.get('/vehicles', asyncHandler(async (req, res) => {
  const input = adminPaginationSchema.parse(req.query)
  const clauses = ['1 = 1']; const params: unknown[] = []
  if (input.status) { clauses.push('v.status = ?'); params.push(input.status) }
  if (input.keyword) { clauses.push('(v.bike_number LIKE ? OR m.model_name LIKE ?)'); params.push(`%${input.keyword}%`, `%${input.keyword}%`) }
  const where = clauses.join(' AND ')
  return ok(res, await list<RowDataPacket>(`SELECT v.vehicle_id, v.bike_number, v.status, v.current_lat, v.current_lng, v.battery_level, v.total_mileage, v.last_maintenance, m.model_name, c.color_name FROM vehicles v JOIN vehicle_models m ON m.model_id = v.model_id JOIN colors c ON c.color_id = v.color_id WHERE ${where} ORDER BY v.vehicle_id DESC`, `SELECT COUNT(*) AS total FROM vehicles v JOIN vehicle_models m ON m.model_id = v.model_id WHERE ${where}`, input, params))
}))

adminRouter.post('/vehicles', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = vehicleCreateSchema.parse(req.body)
  const [model] = await query<RowDataPacket[]>('SELECT model_id FROM vehicle_models ORDER BY model_id ASC LIMIT 1')
  const [color] = await query<RowDataPacket[]>('SELECT color_id FROM colors ORDER BY color_id ASC LIMIT 1')
  if (!model || !color) throw new AppError(409, 'Vehicle model or color is not configured')
  try {
    const result = await query<ResultSetHeader>('INSERT INTO vehicles (bike_number, model_id, color_id, status, battery_level, total_mileage) VALUES (?, ?, ?, ?, ?, 0)', [input.bikeNumber, model.model_id, color.color_id, input.status, input.batteryLevel])
    return created(res, { vehicleId: result.insertId, bikeNumber: input.bikeNumber }, 'Vehicle created')
  } catch (error) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new AppError(409, 'Vehicle number already exists')
    throw error
  }
}))

adminRouter.patch('/vehicles/:vehicleId', asyncHandler(async (req, res) => {
  const input = vehicleUpdateSchema.parse(req.body); const fields: string[] = []; const values: unknown[] = []
  if (input.status !== undefined) { fields.push('status = ?'); values.push(input.status) }
  if (input.batteryLevel !== undefined) { fields.push('battery_level = ?'); values.push(input.batteryLevel) }
  const result = await query<ResultSetHeader>(`UPDATE vehicles SET ${fields.join(', ')} WHERE vehicle_id = ?`, [...values, req.params.vehicleId])
  if (!result.affectedRows) throw new AppError(404, 'Vehicle not found')
  return ok(res, { vehicleId: Number(req.params.vehicleId) }, 'Vehicle updated')
}))

adminRouter.get('/stations', asyncHandler(async (req, res) => {
  const input = adminPaginationSchema.parse(req.query); const where = input.keyword ? 'WHERE zone_name LIKE ?' : ''; const params = input.keyword ? [`%${input.keyword}%`] : []
  return ok(res, await list<RowDataPacket>(`SELECT p.zone_id, p.zone_name, p.center_lat, p.center_lng, p.radius, p.status, COUNT(v.vehicle_id) AS available_vehicles FROM parking_zones p LEFT JOIN vehicles v ON v.status = 'available' AND v.current_lat IS NOT NULL AND v.current_lng IS NOT NULL GROUP BY p.zone_id ${input.keyword ? 'HAVING p.zone_name LIKE ?' : ''} ORDER BY p.zone_id DESC`, `SELECT COUNT(*) AS total FROM parking_zones ${where}`, input, params))
}))

adminRouter.post('/stations', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = stationSchema.parse(req.body); const result = await query<ResultSetHeader>('INSERT INTO parking_zones (zone_name, center_lat, center_lng, radius) VALUES (?, ?, ?, ?)', [input.zoneName, input.centerLat, input.centerLng, input.radius])
  return created(res, { zoneId: result.insertId }, 'Parking zone created')
}))

adminRouter.patch('/stations/:stationId', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = stationUpdateSchema.parse(req.body); const fields = Object.entries(input).map(([key]) => `${({ zoneName: 'zone_name', centerLat: 'center_lat', centerLng: 'center_lng' } as Record<string, string>)[key] || key} = ?`); const result = await query<ResultSetHeader>(`UPDATE parking_zones SET ${fields.join(', ')} WHERE zone_id = ?`, [...Object.values(input), req.params.stationId])
  if (!result.affectedRows) throw new AppError(404, 'Parking zone not found'); return ok(res, { zoneId: Number(req.params.stationId) }, 'Parking zone updated')
}))

adminRouter.get('/orders', asyncHandler(async (req, res) => {
  const input = adminPaginationSchema.parse(req.query); const offset = (input.page - 1) * input.pageSize; const clauses = ['1 = 1']; const params: unknown[] = []
  if (input.keyword) { clauses.push('(order_number LIKE ? OR user_name LIKE ?)'); params.push(`%${input.keyword}%`, `%${input.keyword}%`) }
  if (input.status) { clauses.push('status = ?'); params.push(input.status) }
  if (input.orderType) { clauses.push('order_type = ?'); params.push(input.orderType) }
  if (input.startDate) { clauses.push('DATE(created_at) >= ?'); params.push(input.startDate) }
  if (input.endDate) { clauses.push('DATE(created_at) <= ?'); params.push(input.endDate) }
  const union = `(SELECT 'commerce' AS source, o.order_id, o.order_no AS order_number, u.nickname AS user_name, o.order_type, o.status, o.total_cents AS amount_cents, o.created_at FROM commerce_orders o JOIN users u ON u.user_id = o.user_id UNION ALL SELECT 'rental' AS source, r.order_id, CONCAT('RIDE', r.order_id) AS order_number, u.nickname AS user_name, 'rental' AS order_type, r.status, r.total_fee AS amount_cents, r.start_time AS created_at FROM rental_orders r JOIN users u ON u.user_id = r.user_id)`
  const rows = await query<RowDataPacket[]>(`SELECT * FROM ${union} all_orders WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, input.pageSize, offset])
  const [count] = await query<(RowDataPacket & { total: number })[]>(`SELECT COUNT(*) AS total FROM ${union} all_orders WHERE ${clauses.join(' AND ')}`, params)
  return ok(res, { items: rows, page: input.page, pageSize: input.pageSize, total: Number(count.total) })
}))

adminRouter.get('/orders/:source/:orderId', asyncHandler(async (req, res) => {
  const source = req.params.source === 'rental' ? 'rental' : 'commerce'; const table = source === 'rental' ? 'rental_orders' : 'commerce_orders'; const idField = source === 'rental' ? 'order_id' : 'order_id'
  const [order] = await query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE ${idField} = ? LIMIT 1`, [req.params.orderId]); if (!order) throw new AppError(404, 'Order not found'); return ok(res, { source, ...order })
}))

adminRouter.patch('/orders/:source/:orderId/status', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = orderStatusSchema.parse(req.body); const table = req.params.source === 'rental' ? 'rental_orders' : 'commerce_orders'; const result = await query<ResultSetHeader>(`UPDATE ${table} SET status = ? WHERE order_id = ?`, [input.status, req.params.orderId]); if (!result.affectedRows) throw new AppError(404, 'Order not found'); return ok(res, { source: req.params.source, orderId: Number(req.params.orderId), status: input.status }, 'Order status updated')
}))

adminRouter.get('/products', asyncHandler(async (req, res) => {
  const input = adminPaginationSchema.parse(req.query); const where = input.keyword ? 'WHERE name LIKE ?' : ''; const params = input.keyword ? [`%${input.keyword}%`] : []
  return ok(res, await list<RowDataPacket>(`SELECT product_id, product_type, name, description, price_cents, points_price, image_url, status, created_at, updated_at FROM products ${where} ORDER BY product_id DESC`, `SELECT COUNT(*) AS total FROM products ${where}`, input, params))
}))

adminRouter.patch('/products/:productId', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = productUpdateSchema.parse(req.body); const mapping: Record<string, string> = { priceCents: 'price_cents', pointsPrice: 'points_price', imageUrl: 'image_url' }; const fields = Object.keys(input).map((key) => `${mapping[key] || key} = ?`); const result = await query<ResultSetHeader>(`UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`, [...Object.values(input), req.params.productId])
  if (!result.affectedRows) throw new AppError(404, 'Product not found'); return ok(res, { productId: Number(req.params.productId) }, 'Product updated')
}))

adminRouter.get('/community/posts', asyncHandler(async (req, res) => {
  const input = adminPaginationSchema.parse(req.query); const where = input.status ? 'WHERE p.status = ?' : ''; const params = input.status ? [input.status] : []
  return ok(res, await list<RowDataPacket>(`SELECT p.post_id, p.content, p.status, p.like_count, p.comment_count, p.created_at, u.nickname FROM community_posts p JOIN users u ON u.user_id = p.user_id ${where} ORDER BY p.created_at DESC`, `SELECT COUNT(*) AS total FROM community_posts p ${where}`, input, params))
}))

adminRouter.patch('/community/posts/:postId/status', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = postStatusSchema.parse(req.body); const result = await query<ResultSetHeader>('UPDATE community_posts SET status = ? WHERE post_id = ?', [input.status, req.params.postId]); if (!result.affectedRows) throw new AppError(404, 'Post not found'); return ok(res, { postId: Number(req.params.postId), status: input.status }, 'Post status updated')
}))

adminRouter.get('/repairs', asyncHandler(async (req, res) => {
  const input = adminPaginationSchema.parse(req.query); const where = input.status ? 'WHERE r.status = ?' : ''; const params = input.status ? [input.status] : []
  return ok(res, await list<RowDataPacket>(`SELECT r.ticket_id, r.ticket_no, r.vehicle_identifier, r.issue_types_json, r.description, r.contact_phone, r.status, r.resolution, r.created_at, r.updated_at, u.nickname FROM repair_tickets r JOIN users u ON u.user_id = r.user_id ${where} ORDER BY r.created_at DESC`, `SELECT COUNT(*) AS total FROM repair_tickets r ${where}`, input, params))
}))

adminRouter.patch('/repairs/:ticketId', requireAdmin('super_admin', 'editor'), asyncHandler(async (req, res) => {
  const input = repairUpdateSchema.parse(req.body); const fields = Object.keys(input).map((key) => `${key} = ?`); const result = await query<ResultSetHeader>(`UPDATE repair_tickets SET ${fields.join(', ')} WHERE ticket_id = ?`, [...Object.values(input), req.params.ticketId]); if (!result.affectedRows) throw new AppError(404, 'Repair ticket not found'); return ok(res, { ticketId: Number(req.params.ticketId) }, 'Repair ticket updated')
}))
