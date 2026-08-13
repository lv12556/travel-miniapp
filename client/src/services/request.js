const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: options.auth ? { Authorization: `Bearer ${uni.getStorageSync('accessToken')}` } : {},
      timeout: 10000,
      success: ({ data, statusCode }) => {
        if (statusCode >= 200 && statusCode < 300 && data.code === 0) resolve(data.data)
        else reject(new Error(data.message || '服务暂时不可用'))
      },
      fail: () => reject(new Error('网络连接失败'))
    })
  })
}
