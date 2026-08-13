import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'travel_miniapp',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  }
}
