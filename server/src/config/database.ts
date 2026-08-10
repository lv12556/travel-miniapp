import mysql, { type PoolConnection } from 'mysql2/promise'
import type { QueryResult, RowDataPacket } from 'mysql2'
import { env } from './env.js'

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true
})

export async function query<T extends QueryResult = RowDataPacket[]>(sql: string, values: unknown[] = []): Promise<T> {
  const [rows] = await pool.execute<T>(sql, values)
  return rows
}

export async function transaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await work(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
