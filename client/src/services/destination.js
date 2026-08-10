import { request } from './request'

export const getFeatured = () => request({ url: '/destinations/featured' })
export const getDestinations = (params) => request({ url: '/destinations', data: params })
export const getDestination = (id) => request({ url: `/destinations/${id}` })
export const createBooking = (data) => request({ url: '/bookings', method: 'POST', data })
