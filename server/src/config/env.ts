import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1).default('tuneng_db'),
  DB_USER: z.string().min(1).default('root'),
  DB_PASSWORD: z.string().default(''),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-this-before-production'),
  WECHAT_APPID: z.string().default(''),
  WECHAT_APPSECRET: z.string().default(''),
  ALLOW_DEMO_LOGIN: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  ADMIN_BOOTSTRAP_USERNAME: z.string().trim().max(50).refine((value) => value === '' || value.length >= 3, 'must be empty or at least 3 characters').default(''),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().max(128).refine((value) => value === '' || value.length >= 10, 'must be empty or at least 10 characters').default(''),
  RENTAL_START_FEE_CENTS: z.coerce.number().int().min(0).default(100),
  RENTAL_FEE_PER_MINUTE_CENTS: z.coerce.number().int().min(0).default(30)
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`)
}

export const env = parsed.data

if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'development-only-secret-change-this-before-production') {
  throw new Error('JWT_SECRET must be replaced before production startup')
}

if (env.NODE_ENV === 'production' && (!env.ADMIN_BOOTSTRAP_USERNAME || !env.ADMIN_BOOTSTRAP_PASSWORD)) {
  throw new Error('ADMIN_BOOTSTRAP_USERNAME and ADMIN_BOOTSTRAP_PASSWORD must be configured in production')
}
