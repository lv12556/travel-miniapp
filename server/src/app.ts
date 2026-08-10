import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFound } from './common/middleware/error-handler.js'
import { apiRouter } from './routes/api.router.js'

export const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }))
app.use(express.json({ limit: '1mb' }))
app.use('/api/v1', apiRouter)
app.use(notFound)
app.use(errorHandler)
