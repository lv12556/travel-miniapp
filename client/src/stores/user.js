import { defineStore } from 'pinia'
import { getStoredToken, getStoredUser, loginWithWechat, logout as clearLogin } from '../services/auth'
import { requestWithRetry, setUnauthorizedHandler } from '../services/request'

export const previewUser = {
  user_id: 'TN-20240725', nickname: '林小绿', avatar: '', member_level: '黄金骑士', points: 8620, total_km: 247, trees: 12,
}

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: getStoredUser() || { ...previewUser },
    isLoggedIn: true,
    isPreview: !getStoredToken(),
    loading: false,
    error: '',
    sessionExpired: false,
  }),
  actions: {
    async bootstrap() {
      setUnauthorizedHandler(() => this.markSessionExpired())
      if (getStoredToken()) await this.loadProfile()
    },
    async loadProfile() {
      if (!getStoredToken()) return this.profile
      this.loading = true
      this.error = ''
      try {
        this.profile = await requestWithRetry({ url: '/users/me', auth: true })
        uni.setStorageSync('currentUser', this.profile)
        return this.profile
      } catch (error) {
        this.error = error.message || '用户资料加载失败'
        throw error
      } finally { this.loading = false }
    },
    async login() {
      this.loading = true
      this.error = ''
      try {
        this.profile = await loginWithWechat()
        this.isLoggedIn = true
        this.isPreview = false
        this.sessionExpired = false
        return this.profile
      } catch (error) {
        this.error = error.message || '登录失败'
        throw error
      } finally { this.loading = false }
    },
    async saveProfile(payload) {
      const next = { ...this.profile, ...payload }
      if (!this.isPreview && getStoredToken()) {
        this.loading = true
        this.error = ''
        try { this.profile = await requestWithRetry({ url: '/users/me', method: 'PATCH', data: payload, auth: true }) }
        catch (error) { this.error = error.message || '资料保存失败'; throw error }
        finally { this.loading = false }
      } else this.profile = next
      uni.setStorageSync('currentUser', this.profile)
      return this.profile
    },
    addPoints(amount) { this.profile = { ...this.profile, points: Number(this.profile.points || 0) + amount } },
    spendPoints(amount) {
      if (Number(this.profile.points || 0) < amount) return false
      this.profile = { ...this.profile, points: Number(this.profile.points || 0) - amount }
      return true
    },
    markSessionExpired() { clearLogin(); this.sessionExpired = true; this.isLoggedIn = false; this.isPreview = false },
    logout() { clearLogin(); this.profile = { ...previewUser }; this.isLoggedIn = true; this.isPreview = true; this.sessionExpired = false },
  },
})
