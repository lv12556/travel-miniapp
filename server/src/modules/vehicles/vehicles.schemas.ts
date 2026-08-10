import { z } from 'zod'

export const nearbyVehiclesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(100).max(20000).default(3000),
  limit: z.coerce.number().int().min(1).max(100).default(30)
})
