import { z } from 'zod'

export const productQuerySchema = z.object({
  type: z.enum(['vehicle', 'accessory', 'coupon', 'membership']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
})

export const createOrderSchema = z.object({
  orderType: z.enum(['vehicle', 'accessory', 'points', 'plan']),
  addressId: z.coerce.number().int().positive().optional(),
  remark: z.string().max(255).optional(),
  pointsUsed: z.coerce.number().int().min(0).default(0),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive().optional(),
    productName: z.string().trim().min(1).max(120),
    skuLabel: z.string().max(120).optional(),
    quantity: z.coerce.number().int().min(1).max(99).default(1),
    unitPriceCents: z.coerce.number().int().min(0).default(0),
    pointsPrice: z.coerce.number().int().min(0).optional(),
    imageUrl: z.string().max(700).optional()
  })).min(1).max(20)
})

export const addressSchema = z.object({
  receiverName: z.string().trim().min(1).max(50),
  phone: z.string().regex(/^1\d{10}$/),
  province: z.string().trim().min(1).max(50),
  city: z.string().trim().min(1).max(50),
  district: z.string().max(50).optional(),
  detailAddress: z.string().trim().min(1).max(255),
  isDefault: z.boolean().default(false)
})

export const couponClaimSchema = z.object({ couponId: z.coerce.number().int().positive() })
