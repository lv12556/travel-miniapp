import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../errors/app-error.js'

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ code: 404, message: `Route not found: ${req.method} ${req.path}` })
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ code: 400, message: 'Request validation failed', details: error.flatten() })
    return
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ code: error.statusCode, message: error.message, details: error.details })
    return
  }
  console.error(error)
  res.status(500).json({ code: 500, message: 'Internal server error' })
}
