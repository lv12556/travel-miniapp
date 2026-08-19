import { z } from 'zod'

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  keyword: z.string().trim().max(100).optional(),
  status: z.string().trim().max(30).optional(),
  orderType: z.string().trim().max(30).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional()
})

export const vehicleUpdateSchema = z.object({
  status: z.enum(['available', 'in_use', 'maintenance', 'offline']).optional(),
  batteryLevel: z.coerce.number().int().min(0).max(100).optional()
}).refine((value) => value.status !== undefined || value.batteryLevel !== undefined, 'At least one field is required')
export const vehicleCreateSchema = z.object({
  bikeNumber: z.string().trim().min(2).max(40),
  batteryLevel: z.coerce.number().int().min(0).max(100).default(100),
  status: z.enum(['available', 'maintenance', 'offline']).default('available')
})

export const stationSchema = z.object({
  zoneName: z.string().trim().min(2).max(100),
  centerLat: z.coerce.number().min(-90).max(90),
  centerLng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(10).max(5000)
})

export const stationUpdateSchema = stationSchema.partial().extend({ status: z.coerce.number().int().min(0).max(1).optional() }).refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const productUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().max(4000).nullable().optional(),
  priceCents: z.coerce.number().int().min(0).optional(),
  pointsPrice: z.coerce.number().int().min(0).nullable().optional(),
  imageUrl: z.string().max(700).nullable().optional(),
  status: z.enum(['active', 'inactive']).optional()
}).refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const postStatusSchema = z.object({ status: z.enum(['published', 'hidden']) })
export const repairUpdateSchema = z.object({ status: z.enum(['submitted', 'processing', 'resolved', 'closed']).optional(), resolution: z.string().max(4000).nullable().optional() }).refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const adminCreateSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(10).max(128),
  role: z.enum(['super_admin', 'editor']).default('editor')
})

export const adminStatusSchema = z.object({ status: z.coerce.number().int().min(0).max(1) })

export const merchantUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  merchantType: z.enum(['dealer', 'scenic', 'campus']).optional(),
  contactName: z.string().trim().min(1).max(50).optional(),
  contactPhone: z.string().trim().max(30).optional(),
  status: z.enum(['active', 'pending', 'frozen', 'rejected']).optional(),
  cooperationSummary: z.string().max(1000).nullable().optional()
}).refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const orderStatusSchema = z.object({ status: z.enum(['pending_payment', 'paid', 'shipped', 'completed', 'cancelled', 'after_sales']) })
