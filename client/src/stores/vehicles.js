import { defineStore } from 'pinia'
import { requestWithRetry } from '../services/request'

export const useVehiclesStore = defineStore('vehicles', {
  state: () => ({ nearbyVehicles: [], stations: [], currentTrip: null, loading: false, error: '' }),
  actions: {
    async loadNearby({ lat = 31.5842, lng = 120.3027 } = {}) {
      this.loading = true; this.error = ''
      try {
        const [vehicles, stations] = await Promise.all([
          requestWithRetry({ url: `/vehicles/nearby?lat=${lat}&lng=${lng}&limit=20` }),
          requestWithRetry({ url: `/stations?lat=${lat}&lng=${lng}` }),
        ])
        this.nearbyVehicles = vehicles?.items || vehicles || []
        this.stations = stations?.items || stations || []
      } catch (error) { this.error = error.message || '附近车辆加载失败'; throw error }
      finally { this.loading = false }
    },
    async refresh(location) { return this.loadNearby(location) },
  },
})
