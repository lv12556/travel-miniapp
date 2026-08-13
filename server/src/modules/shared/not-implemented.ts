import type { RequestHandler } from 'express'

/** Endpoint contract is available before its SQL repository is mapped to the supplied schema. */
export const notImplemented = (moduleName: string): RequestHandler => (_req, res) => {
  res.status(501).json({ code: 501, message: `${moduleName} repository has not been mapped to the database schema yet` })
}
