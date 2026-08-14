import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { query } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { created, ok } from '../../common/http/response.js'
import { requireUser } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { endTrip, startTrip } from './trips.service.js'
import { endTripSchema, paginationSchema, startTripSchema, trackPointSchema } from './trips.schemas.js'

export const tripsRouter = Router()
type TripRow = RowDataPacket & { order_id: number; vehicle_id: number; bike_number: string; model_name: string; color_name: string; start_time: Date; end_time: Date | null; total_fee: number; status: string }
tripsRouter.use(requireUser)
tripsRouter.post('/start', asyncHandler(async (req, res) => {
  const input = startTripSchema.parse(req.body)
  return created(res, await startTrip(req.auth!.userId, input.vehicleId), 'Trip started')
}))
tripsRouter.post('/:tripId/end', asyncHandler(async (req, res) => {
  const input = endTripSchema.parse(req.body)
  return ok(res, await endTrip(req.auth!.userId, Number(req.params.tripId), input.lat, input.lng), 'Trip completed')
}))
tripsRouter.post('/:tripId/tracks', asyncHandler(async (req, res) => {
  const input = trackPointSchema.parse(req.body)
  const [trip] = await query<TripRow[]>('SELECT order_id, vehicle_id, bike_number, \'\' AS model_name, \'\' AS color_name, start_time, end_time, total_fee, status FROM rental_orders JOIN vehicles USING (vehicle_id) WHERE order_id = ? AND user_id = ? LIMIT 1', [req.params.tripId, req.auth!.userId])
  if (!trip) throw new AppError(404, 'Trip not found')
  const result = await query<ResultSetHeader>('INSERT INTO trip_tracks (order_id, lat, lng, recorded_at) VALUES (?, ?, ?, COALESCE(?, NOW()))', [trip.order_id, input.lat, input.lng, input.recordedAt ?? null])
  return created(res, { trackId: result.insertId })
}))
tripsRouter.get('/history', asyncHandler(async (req, res) => {
  const input = paginationSchema.parse(req.query)
  const offset = (input.page - 1) * input.pageSize
  const rows = await query<TripRow[]>(`SELECT o.order_id, o.vehicle_id, v.bike_number, m.model_name, c.color_name, o.start_time, o.end_time, o.total_fee, o.status FROM rental_orders o JOIN vehicles v ON v.vehicle_id = o.vehicle_id JOIN vehicle_models m ON m.model_id = v.model_id JOIN colors c ON c.color_id = v.color_id WHERE o.user_id = ? ORDER BY o.start_time DESC LIMIT ? OFFSET ?`, [req.auth!.userId, input.pageSize, offset])
  const [count] = await query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM rental_orders WHERE user_id = ?', [req.auth!.userId])
  return ok(res, { items: rows, page: input.page, pageSize: input.pageSize, total: count.total })
}))

tripsRouter.get('/current', asyncHandler(async (req, res) => {
  const [trip] = await query<TripRow[]>(`SELECT o.order_id, o.vehicle_id, v.bike_number, m.model_name, c.color_name, o.start_time, o.end_time, o.total_fee, o.status FROM rental_orders o JOIN vehicles v ON v.vehicle_id = o.vehicle_id JOIN vehicle_models m ON m.model_id = v.model_id JOIN colors c ON c.color_id = v.color_id WHERE o.user_id = ? AND o.status = 'ongoing' ORDER BY o.start_time DESC LIMIT 1`, [req.auth!.userId])
  return ok(res, trip ?? null)
}))

tripsRouter.get('/:tripId', asyncHandler(async (req, res) => {
  const [trip] = await query<TripRow[]>(`SELECT o.order_id, o.vehicle_id, v.bike_number, m.model_name, c.color_name, o.start_time, o.end_time, o.total_fee, o.status FROM rental_orders o JOIN vehicles v ON v.vehicle_id = o.vehicle_id JOIN vehicle_models m ON m.model_id = v.model_id JOIN colors c ON c.color_id = v.color_id WHERE o.order_id = ? AND o.user_id = ? LIMIT 1`, [req.params.tripId, req.auth!.userId])
  if (!trip) throw new AppError(404, 'Trip not found')
  const tracks = await query<RowDataPacket[]>('SELECT track_id, lat, lng, recorded_at FROM trip_tracks WHERE order_id = ? ORDER BY recorded_at ASC', [req.params.tripId])
  return ok(res, { ...trip, tracks })
}))
