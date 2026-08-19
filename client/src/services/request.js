const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

let unauthorizedHandler = null

export class ApiError extends Error {
  constructor(message, { statusCode = 0, code = '', retryable = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.retryable = retryable
  }
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: options.auth ? { Authorization: `Bearer ${uni.getStorageSync('accessToken')}` } : {},
      timeout: 10000,
      success: ({ data, statusCode }) => {
        if (statusCode >= 200 && statusCode < 300 && data?.code === 0) resolve(data.data)
        else {
          const error = new ApiError(data?.message || '服务暂时不可用', {
            statusCode,
            code: data?.code,
            retryable: statusCode === 429 || statusCode >= 500,
          })
          if (statusCode === 401 && unauthorizedHandler) unauthorizedHandler(error)
          reject(error)
        }
      },
      fail: () => reject(new ApiError('网络连接失败，请检查网络后重试', { retryable: true }))
    })
  })
}

export async function requestWithRetry(options, { retries = 2, retryDelay = 500 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await request(options)
    } catch (error) {
      lastError = error
      if (!error?.retryable || attempt === retries) break
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
    }
  }
  throw lastError
}

export function setAccessToken(token) {
  if (token) uni.setStorageSync('accessToken', token)
  else uni.removeStorageSync('accessToken')
}
