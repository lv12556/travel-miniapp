import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.router.js'
import { healthRouter } from '../modules/health/health.router.js'
import { pointsRouter } from '../modules/points/points.router.js'
import { stationsRouter } from '../modules/stations/stations.router.js'
import { tripsRouter } from '../modules/trips/trips.router.js'
import { usersRouter } from '../modules/users/users.router.js'
import { vehiclesRouter } from '../modules/vehicles/vehicles.router.js'
import { commerceRouter } from '../modules/commerce/commerce.router.js'
import { engagementRouter } from '../modules/engagement/engagement.router.js'
import { notificationsRouter } from '../modules/notifications/notifications.router.js'
import { benefitsRouter } from '../modules/benefits/benefits.router.js'

export const apiRouter = Router()
apiRouter.use('/health', healthRouter)
apiRouter.use('/auth', authRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/points', pointsRouter)
apiRouter.use('/stations', stationsRouter)
apiRouter.use('/vehicles', vehiclesRouter)
apiRouter.use('/trips', tripsRouter)
apiRouter.use('/commerce', commerceRouter)
apiRouter.use('/community', engagementRouter)
apiRouter.use('/notifications', notificationsRouter)
apiRouter.use('/benefits', benefitsRouter)
