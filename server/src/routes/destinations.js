import { Router } from 'express'
import { destinations } from '../data/destinations.js'
import { fail, ok } from '../lib/response.js'

export const destinationsRouter = Router()

destinationsRouter.get('/featured', (_, res) => ok(res, destinations))
destinationsRouter.get('/', (req, res) => {
  const keyword = String(req.query.keyword || '').trim()
  const category = String(req.query.category || '').trim()
  const list = destinations.filter((item) => (!keyword || `${item.title}${item.city}`.includes(keyword)) && (!category || item.category === category))
  ok(res, list)
})
destinationsRouter.get('/:id', (req, res) => {
  const item = destinations.find((entry) => entry.id === Number(req.params.id))
  if (!item) return fail(res, 404, '目的地不存在')
  return ok(res, item)
})
