import { Router } from 'express'
import type { RowDataPacket } from 'mysql2'
import { query } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { ok } from '../../common/http/response.js'
import { requireUser } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { startTrip } from '../trips/trips.service.js'
import { nearbyVehiclesSchema } from './vehicles.schemas.js'

export const vehiclesRouter = Router()
type VehicleRow = RowDataPacket & { vehicle_id: number; bike_number: string; status: string; current_lat: string | null; current_lng: string | null; battery_level: number; total_mileage: number; model_id: number; model_name: string; model_desc: string | null; color_id: number; color_name: string; color_code: string | null; distance_meters?: number }
type AssetRow = RowDataPacket & { asset_id: number; color_id: number | null; asset_type: string; asset_name: string; asset_path: string; sort_order: number }
const fields = `v.vehicle_id, v.bike_number, v.status, v.current_lat, v.current_lng, v.battery_level, v.total_mileage, v.last_maintenance, m.model_id, m.model_name, m.model_desc, m.base_price, m.battery_capacity, m.solar_panel, c.color_id, c.color_name, c.color_code`
const joins = `FROM vehicles v JOIN vehicle_models m ON m.model_id = v.model_id JOIN colors c ON c.color_id = v.color_id`

vehiclesRouter.get('/nearby', asyncHandler(async (req, res) => {
  const input = nearbyVehiclesSchema.parse(req.query)
  const distance = `6371000 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(v.current_lat - ?) / 2), 2) + COS(RADIANS(?)) * COS(RADIANS(v.current_lat)) * POWER(SIN(RADIANS(v.current_lng - ?) / 2), 2)))`
  const rows = await query<VehicleRow[]>(`SELECT ${fields}, ${distance} AS distance_meters ${joins} WHERE v.status = 'available' AND v.current_lat IS NOT NULL AND v.current_lng IS NOT NULL HAVING distance_meters <= ? ORDER BY distance_meters LIMIT ?`, [input.lat, input.lat, input.lng, input.radius, input.limit])
  return ok(res, rows)
}))
vehiclesRouter.get('/models/:modelId/assets', asyncHandler(async (req, res) => {
  const colorId = req.query.colorId ? Number(req.query.colorId) : null
  const sql = colorId === null
    ? 'SELECT asset_id, color_id, asset_type, asset_name, asset_path, sort_order FROM vehicle_model_assets WHERE model_id = ? ORDER BY asset_type, sort_order'
    : 'SELECT asset_id, color_id, asset_type, asset_name, asset_path, sort_order FROM vehicle_model_assets WHERE model_id = ? AND (color_id IS NULL OR color_id = ?) ORDER BY asset_type, sort_order'
  const rows = await query<AssetRow[]>(sql, colorId === null ? [req.params.modelId] : [req.params.modelId, colorId])
  return ok(res, rows)
}))
vehiclesRouter.get('/:vehicleId', asyncHandler(async (req, res) => {
  const [vehicle] = await query<VehicleRow[]>(`SELECT ${fields} ${joins} WHERE v.vehicle_id = ? LIMIT 1`, [req.params.vehicleId])
  if (!vehicle) throw new AppError(404, 'Vehicle not found')
  return ok(res, vehicle)
}))
vehiclesRouter.post('/:vehicleId/unlock', requireUser, asyncHandler(async (req, res) => {
  const order = await startTrip(req.auth!.userId, Number(req.params.vehicleId))
  return ok(res, order, 'Vehicle unlocked and trip started')
}))
