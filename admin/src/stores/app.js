import { defineStore } from 'pinia'
import { adminApi } from '../services/admin-api'

export const useAppStore = defineStore('admin-app', {
  state: () => ({
    collapsed: false,
    loading: false,
    apiOnline: null,
    overview: { users: 0, stations: 0, vehicles: 0, products: 0, rentalOrders: 0, commerceOrders: 0, pendingRepairs: 0, hiddenPosts: 0 },
    admin: null,
    updatedAt: ''
  }),
  actions: {
    async loadOverview() {
      this.loading = true
      try {
        const [health, dashboard, admin] = await Promise.all([
          adminApi.health(),
          adminApi.dashboard(),
          adminApi.me()
        ])
        this.apiOnline = health.status === 'up'
        this.overview = dashboard
        this.admin = admin
        this.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
      } catch {
        this.apiOnline = false
      } finally {
        this.loading = false
      }
    }
  }
})
