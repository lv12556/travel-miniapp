import { defineStore } from 'pinia'
import { requestWithRetry } from '../services/request'

export const usePointsStore = defineStore('points', {
  state: () => ({ balance: 8620, memberLevel: '黄金骑士', transactions: [], redeemed: [], loading: false, error: '', page: 1, pageSize: 20, hasMore: true }),
  actions: {
    async loadSummary() {
      this.loading = true; this.error = ''
      try {
        const summary = await requestWithRetry({ url: '/points/summary', auth: true })
        this.balance = Number(summary?.points ?? summary?.balance ?? this.balance)
        this.memberLevel = summary?.memberLevel || summary?.member_level || this.memberLevel
      } catch (error) { this.error = error.message || '积分余额加载失败' }
      finally { this.loading = false }
    },
    async loadTransactions({ reset = true } = {}) {
      if (this.loading) return
      this.loading = true; this.error = ''
      const nextPage = reset ? 1 : this.page + 1
      try {
        const result = await requestWithRetry({ url: `/points/transactions?page=${nextPage}&pageSize=${this.pageSize}`, auth: true })
        const items = result?.items || result?.list || result || []
        this.transactions = reset ? items : [...this.transactions, ...items]
        this.page = nextPage; this.hasMore = items.length >= this.pageSize
      } catch (error) { this.error = error.message || '积分明细加载失败' }
      finally { this.loading = false }
    },
    loadMoreTransactions() { return this.hasMore ? this.loadTransactions({ reset: false }) : Promise.resolve() },
    redeem(item, spend) {
      if (this.redeemed.includes(item.id) || !spend(item.pts)) return false
      this.redeemed.push(item.id)
      return true
    },
  },
})
