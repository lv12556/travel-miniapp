import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { env } from '../../config/env.js'
import { query } from '../../config/database.js'

const scrypt = promisify(scryptCallback)

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64) as Buffer
  return `scrypt$${salt}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expected] = encoded.split('$')
  if (algorithm !== 'scrypt' || !salt || !expected) return false
  const actual = await scrypt(password, salt, 64) as Buffer
  const expectedBuffer = Buffer.from(expected, 'hex')
  return expectedBuffer.length === actual.length && timingSafeEqual(expectedBuffer, actual)
}

export async function initializeBootstrapAdmin() {
  if (!env.ADMIN_BOOTSTRAP_USERNAME || !env.ADMIN_BOOTSTRAP_PASSWORD) return false
  const rows = await query<RowDataPacket[]>('SELECT admin_id FROM admins WHERE username = ? LIMIT 1', [env.ADMIN_BOOTSTRAP_USERNAME])
  if (rows.length) return false
  const passwordHash = await hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD)
  await query<ResultSetHeader>('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, \'super_admin\')', [env.ADMIN_BOOTSTRAP_USERNAME, passwordHash])
  return true
}
