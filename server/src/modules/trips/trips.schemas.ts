import { z } from 'zod'

export const startTripSchema = z.object({ vehicleId: z.coerce.number().int().positive() })
export const endTripSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180)
})
export const trackPointSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  recordedAt: z.string().datetime().optional()
})
export const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) })
