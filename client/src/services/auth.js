import { request, setAccessToken } from './request'

const USER_KEY = 'currentUser'

export function getStoredUser() {
  const value = uni.getStorageSync(USER_KEY)
  if (!value) return null
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch { return null }
  }
  return value
}

export function getStoredToken() {
  return uni.getStorageSync('accessToken') || ''
}

export async function loginWithWechat() {
  // uni.login is available in the WeChat mini-program runtime. H5 cannot
  // obtain a mini-program code and should direct the user to open WeChat.
  // #ifdef H5
  throw new Error('请在微信小程序中使用微信登录')
  // #endif
  // #ifdef MP-WEIXIN
  const loginResult = await new Promise((resolve, reject) => {
    uni.login({ provider: 'weixin', success: resolve, fail: reject })
  })
  if (!loginResult.code) throw new Error('微信登录未获取到授权码')
  const user = await request({
    url: '/auth/mini-program-login',
    method: 'POST',
    data: { code: loginResult.code },
  })
  setAccessToken(user.accessToken)
  uni.setStorageSync(USER_KEY, user.user)
  return user.user
  // #endif
}

export function logout() {
  setAccessToken('')
  uni.removeStorageSync(USER_KEY)
}

