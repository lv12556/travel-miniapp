import { request } from './request'
import { stations, vehicles } from '../data/fallback'

const location = { lat: 31.2304, lng: 121.4737 }

export async function getNearbyVehicles() {
  try { return await request({ url: '/vehicles/nearby', data: { ...location, radius: 3000, limit: 20 } }) } catch (_) { return vehicles }
}

export async function getVehicle(id) {
  try { return await request({ url: `/vehicles/${id}` }) } catch (_) { return vehicles.find((item) => Number(item.vehicle_id) === Number(id)) || vehicles[0] }
}

export async function getStations() {
  try { return await request({ url: '/stations', data: location }) } catch (_) { return stations }
}

export async function unlockVehicle(id) {
  try { return await request({ url: `/vehicles/${id}/unlock`, method: 'POST' }) } catch (_) { return { order_id: Date.now(), vehicle_id: id, status: 'ongoing' } }
}
