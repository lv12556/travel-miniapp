import mysql from 'mysql2/promise'
import { env } from '../config/env.js'

// Import this pool from repositories once MySQL is configured.
export const pool = mysql.createPool({ ...env.db, waitForConnections: true, connectionLimit: 10, queueLimit: 0 })
