import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { destinationsRouter } from './routes/destinations.js'
import { bookingsRouter } from './routes/bookings.js'
import { fail, ok } from './lib/response.js'

const app = express()
app.use(cors({ origin: env.corsOrigin }))
app.use(express.json())
app.get('/api/health', (_, res) => ok(res, { status: 'up' }))
app.use('/api/destinations', destinationsRouter)
app.use('/api/bookings', bookingsRouter)
app.use((_, res) => fail(res, 404, '接口不存在'))
app.use((error, _, res, __) => { console.error(error); fail(res, 500, '服务器内部错误') })

app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`))
