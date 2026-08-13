import { Router } from 'express'
import type { RowDataPacket } from 'mysql2'
import { query } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { ok } from '../../common/http/response.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { locationQuerySchema } from './stations.schemas.js'

export const stationsRouter = Router()
type StationRow = RowDataPacket & { zone_id: number; zone_name: string; center_lat: string; center_lng: string; radius: number; available_vehicles: number; distance_meters?: number }

const availableCount = `(SELECT COUNT(*) FROM vehicles v WHERE v.status = 'available' AND v.current_lat IS NOT NULL AND v.current_lng IS NOT NULL AND 6371000 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(v.current_lat - p.center_lat) / 2), 2) + COS(RADIANS(p.center_lat)) * COS(RADIANS(v.current_lat)) * POWER(SIN(RADIANS(v.current_lng - p.center_lng) / 2), 2))) <= p.radius)`
const baseSql = `SELECT p.zone_id, p.zone_name, p.center_lat, p.center_lng, p.radius, ${availableCount} AS available_vehicles`

stationsRouter.get('/', asyncHandler(async (req, res) => {
  const input = locationQuerySchema.parse(req.query)
  if (input.lat === undefined || input.lng === undefined) {
    const rows = await query<StationRow[]>(`${baseSql} FROM parking_zones p WHERE p.status = 1 ORDER BY p.zone_name`)
    return ok(res, rows)
  }
  const distance = `6371000 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(p.center_lat - ?) / 2), 2) + COS(RADIANS(?)) * COS(RADIANS(p.center_lat)) * POWER(SIN(RADIANS(p.center_lng - ?) / 2), 2)))`
  const rows = await query<StationRow[]>(`${baseSql}, ${distance} AS distance_meters FROM parking_zones p WHERE p.status = 1 HAVING distance_meters <= ? ORDER BY distance_meters`, [input.lat, input.lat, input.lng, input.radius])
  return ok(res, rows)
}))
stationsRouter.get('/:stationId', asyncHandler(async (req, res) => {
  const [station] = await query<StationRow[]>(`${baseSql} FROM parking_zones p WHERE p.zone_id = ? AND p.status = 1 LIMIT 1`, [req.params.stationId])
  if (!station) throw new AppError(404, 'Parking zone not found')
  return ok(res, station)
}))
