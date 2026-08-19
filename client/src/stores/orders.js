import { defineStore } from 'pinia'
import { requestWithRetry } from '../services/request'

const demoRides = [
  { id: 1, date: '2026/08/12', route: '南禅寺 - 崇安寺', time: '08:32 - 09:08', km: '12.4 km', fee: '¥6.00', pts: '+52', carbon: '318 g' },
  { id: 2, date: '2026/08/05', route: '清名桥 - 古运河', time: '17:48 - 18:15', km: '6.8 km', fee: '¥4.00', pts: '+29', carbon: '172 g' },
]

export const useOrdersStore = defineStore('orders', {
  state: () => ({ purchaseOrders: [], rideHistory: demoRides, loading: false, error: '', page: 1, pageSize: 20, hasMore: true }),
  actions: {
    async loadRideHistory({ reset = true } = {}) {
      if (this.loading) return
      this.loading = true; this.error = ''
      const nextPage = reset ? 1 : this.page + 1
      try {
        const result = await requestWithRetry({ url: `/trips/history?page=${nextPage}&pageSize=${this.pageSize}`, auth: true })
        const items = result?.items || result?.list || result || []
        this.rideHistory = reset ? items : [...this.rideHistory, ...items]
        this.page = nextPage; this.hasMore = items.length >= this.pageSize
      } catch (error) { this.error = error.message || '骑行订单加载失败'; if (!reset) throw error }
      finally { this.loading = false }
    },
    loadMoreRideHistory() { return this.hasMore ? this.loadRideHistory({ reset: false }) : Promise.resolve() },
    addPurchaseOrder(order) { this.purchaseOrders.unshift({ ...order, source: 'local' }) },
  },
})
