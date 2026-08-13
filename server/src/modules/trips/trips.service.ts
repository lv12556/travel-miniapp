import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { transaction } from '../../config/database.js'
import { env } from '../../config/env.js'
import { AppError } from '../../common/errors/app-error.js'

type LockedVehicle = RowDataPacket & { vehicle_id: number; status: string }
type LockedOrder = RowDataPacket & { order_id: number; vehicle_id: number; start_time: Date; status: string }

export async function startTrip(userId: number, vehicleId: number) {
  return transaction(async (connection) => {
    const [activeOrders] = await connection.execute<LockedOrder[]>('SELECT order_id, vehicle_id, start_time, status FROM rental_orders WHERE user_id = ? AND status = \'ongoing\' FOR UPDATE', [userId])
    if (activeOrders.length) throw new AppError(409, 'User already has an ongoing trip')
    const [vehicles] = await connection.execute<LockedVehicle[]>('SELECT vehicle_id, status FROM vehicles WHERE vehicle_id = ? FOR UPDATE', [vehicleId])
    const vehicle = vehicles[0]
    if (!vehicle) throw new AppError(404, 'Vehicle not found')
    if (vehicle.status !== 'available') throw new AppError(409, 'Vehicle is not available')
    const [result] = await connection.execute<ResultSetHeader>('INSERT INTO rental_orders (user_id, vehicle_id, start_time, status) VALUES (?, ?, NOW(), \'ongoing\')', [userId, vehicleId])
    await connection.execute('UPDATE vehicles SET status = \'in_use\' WHERE vehicle_id = ?', [vehicleId])
    return { orderId: result.insertId, vehicleId, status: 'ongoing' }
  })
}

export async function endTrip(userId: number, orderId: number, lat: number, lng: number) {
  return transaction(async (connection) => {
    const [orders] = await connection.execute<LockedOrder[]>('SELECT order_id, vehicle_id, start_time, status FROM rental_orders WHERE order_id = ? AND user_id = ? FOR UPDATE', [orderId, userId])
    const order = orders[0]
    if (!order) throw new AppError(404, 'Trip not found')
    if (order.status !== 'ongoing') throw new AppError(409, 'Trip is already closed')
    const minutes = Math.max(1, Math.ceil((Date.now() - new Date(order.start_time).getTime()) / 60000))
    const totalFee = env.RENTAL_START_FEE_CENTS + minutes * env.RENTAL_FEE_PER_MINUTE_CENTS
    const points = Math.max(10, Math.floor(totalFee / 20))
    await connection.execute('UPDATE rental_orders SET end_time = NOW(), total_fee = ?, status = \'completed\' WHERE order_id = ?', [totalFee, orderId])
    await connection.execute('UPDATE vehicles SET status = \'available\', current_lat = ?, current_lng = ? WHERE vehicle_id = ?', [lat, lng, order.vehicle_id])
    await connection.execute('INSERT INTO vehicle_location_history (vehicle_id, lat, lng) VALUES (?, ?, ?)', [order.vehicle_id, lat, lng])
    await connection.execute('INSERT INTO trip_tracks (order_id, lat, lng) VALUES (?, ?, ?)', [orderId, lat, lng])
    await connection.execute('INSERT INTO points_transactions (user_id, amount, type, description) VALUES (?, ?, \'ride\', ?)', [userId, points, `骑行订单 #${orderId} 获得碳积分`])
    await connection.execute('UPDATE users SET points = points + ? WHERE user_id = ?', [points, userId])
    return { orderId, status: 'completed', totalFee, durationMinutes: minutes, earnedPoints: points }
  })
}
