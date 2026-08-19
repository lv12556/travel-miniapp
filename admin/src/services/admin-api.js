import http from './http'

const unwrap = (response) => response.data
const demoEnabled = import.meta.env.DEV && (import.meta.env.VITE_ADMIN_DEMO_LOGIN === 'true' || import.meta.env.VITE_ADMIN_DEMO_LOGIN === undefined)
const demoUsername = import.meta.env.VITE_ADMIN_DEMO_USERNAME || '12345'
const demoPassword = import.meta.env.VITE_ADMIN_DEMO_PASSWORD || '00000000'
const demoToken = 'local-admin-demo-token'
const isDemoToken = () => localStorage.getItem('tuneng_admin_token') === demoToken
const demoStations = [
  { zone_id: 1, zone_name: '无锡站南广场', center_lat: '31.58500000', center_lng: '120.30500000', radius: 120, status: 1, available_vehicles: 1 },
  { zone_id: 2, zone_name: '崇安寺步行街停车点', center_lat: '31.58200000', center_lng: '120.30200000', radius: 100, status: 1, available_vehicles: 1 },
  { zone_id: 3, zone_name: '南禅寺牌楼停车点', center_lat: '31.56600000', center_lng: '120.29800000', radius: 100, status: 1, available_vehicles: 1 },
  { zone_id: 4, zone_name: '清名桥古运河停车点', center_lat: '31.55200000', center_lng: '120.30600000', radius: 120, status: 1, available_vehicles: 0 },
  { zone_id: 5, zone_name: '无锡博物院停车点', center_lat: '31.54300000', center_lng: '120.28600000', radius: 100, status: 1, available_vehicles: 1 },
  { zone_id: 6, zone_name: '蠡湖公园停车点', center_lat: '31.50300000', center_lng: '120.24600000', radius: 150, status: 1, available_vehicles: 0 }
]
const demoVehicles = [
  { vehicle_id: 1, bike_number: 'TN001', model_name: 'T87D', color_name: '珍珠白', status: 'available', battery_level: 92, total_mileage: 1280, current_lat: '31.58421000', current_lng: '120.30268000' },
  { vehicle_id: 2, bike_number: 'TN002', model_name: 'T87D', color_name: '粉', status: 'available', battery_level: 85, total_mileage: 946, current_lat: '31.56881000', current_lng: '120.30856000' },
  { vehicle_id: 3, bike_number: 'TN003', model_name: 'T87D', color_name: '红', status: 'available', battery_level: 96, total_mileage: 712, current_lat: '31.55694000', current_lng: '120.31136000' },
  { vehicle_id: 4, bike_number: 'TN004', model_name: 'T87D', color_name: '迈阿密蓝', status: 'maintenance', battery_level: 81, total_mileage: 1540, current_lat: '31.53414000', current_lng: '120.24406000' }
]
const demoProducts = [
  { product_id: 1, name: '途能 T87D 太阳能助力车', product_type: 'vehicle', price_cents: 499900, points_price: null, status: 'active', image_url: '/static/products/vehicles/t87d-moon-white-card.png' },
  { product_id: 2, name: '轻量骑行头盔', product_type: 'accessory', price_cents: 29900, points_price: null, status: 'active', image_url: '/static/products/accessories/helmet.png' },
  { product_id: 3, name: '防水骑行包', product_type: 'accessory', price_cents: 16900, points_price: null, status: 'active', image_url: '/static/products/accessories/waterproof-bag.png' },
  { product_id: 4, name: '智能车锁', product_type: 'accessory', price_cents: 19900, points_price: null, status: 'active', image_url: '/static/products/accessories/smart-lock.png' },
  { product_id: 5, name: '户外补能灯', product_type: 'accessory', price_cents: 12900, points_price: null, status: 'active', image_url: '/static/products/accessories/recharge-light.png' }
]
const demoOrders = [
  { source: 'commerce', order_id: 1001, order_number: 'TN20260819001', user_name: '绿色骑行者', order_type: 'vehicle', status: 'paid', amount_cents: 499900, created_at: '2026-08-19 09:30:00' },
  { source: 'commerce', order_id: 1002, order_number: 'TN20260819002', user_name: '无锡用户', order_type: 'accessory', status: 'pending_payment', amount_cents: 29900, created_at: '2026-08-19 10:15:00' },
  { source: 'rental', order_id: 201, order_number: 'RIDE201', user_name: '绿色骑行者', order_type: 'rental', status: 'completed', amount_cents: 560, created_at: '2026-08-18 17:20:00' }
]
const demoPosts = [
  { post_id: 1, nickname: '晨光骑行', content: '从无锡站一路骑到蠡湖，今天的风很舒服。', status: 'published', like_count: 28, comment_count: 6, created_at: '2026-08-19 08:20:00' },
  { post_id: 2, nickname: '低碳生活家', content: '晒一下我的绿色骑行季徽章，今天减碳 3.6kg。', status: 'published', like_count: 16, comment_count: 3, created_at: '2026-08-18 15:40:00' }
]
const demoRepairs = [{ ticket_id: 1, ticket_no: 'RP20260819001', nickname: '绿色骑行者', vehicle_identifier: 'TN004', issue_types_json: '["刹车异常"]', status: 'processing', resolution: null, created_at: '2026-08-19 11:10:00' }]
const demoUsers = [
  { user_id: 1, nickname: '绿色骑行者', phone: '138****1201', avatar: '', member_level: 'gold', points: 860, status: 1, created_at: '2026-07-18 09:20:00' },
  { user_id: 2, nickname: '晨光骑行', phone: '139****3422', avatar: '', member_level: 'silver', points: 420, status: 1, created_at: '2026-07-22 14:10:00' },
  { user_id: 3, nickname: '低碳生活家', phone: '150****7810', avatar: '', member_level: 'bronze', points: 120, status: 0, created_at: '2026-08-02 16:45:00' }
]
const demoMerchants = [
  { merchant_id: 1, name: '无锡绿色出行经销中心', merchant_type: 'dealer', contact_name: '张经理', contact_phone: '138****2222', status: 'active', cooperation_summary: '负责无锡区域整车销售与售后', created_at: '2026-07-10 10:00:00' },
  { merchant_id: 2, name: '蠡湖生态景区', merchant_type: 'scenic', contact_name: '王老师', contact_phone: '139****7654', status: 'pending', cooperation_summary: '申请部署 20 辆共享车辆', created_at: '2026-08-16 15:30:00' },
  { merchant_id: 3, name: '江南大学骑行服务中心', merchant_type: 'campus', contact_name: '李老师', contact_phone: '151****9088', status: 'frozen', cooperation_summary: '校园停车点运营合作', created_at: '2026-06-26 11:20:00' }
]
const demoOverview = {
  todayOrders: 18, todayRevenueCents: 186900, users: 8, stations: demoStations.length, vehicles: demoVehicles.length, onlineVehicles: 3, products: demoProducts.length, rentalOrders: 1, commerceOrders: 2, pendingOrders: 3, pendingRepairs: 1, pendingMerchants: 1, hiddenPosts: 0,
  orderTrend: [{ label: '08-13', value: 8 }, { label: '08-14', value: 12 }, { label: '08-15', value: 10 }, { label: '08-16', value: 16 }, { label: '08-17', value: 14 }, { label: '08-18', value: 21 }, { label: '08-19', value: 18 }],
  vehicleStatus: [{ label: 'available', value: 3 }, { label: 'maintenance', value: 1 }],
  stationAvailability: demoStations.map(({ zone_name, available_vehicles }) => ({ label: zone_name, value: available_vehicles }))
}
const demoRows = { users: demoUsers, merchants: demoMerchants, vehicles: demoVehicles, stations: demoStations, orders: demoOrders, products: demoProducts, community: demoPosts, repairs: demoRepairs }
const demoList = (resource, params = {}) => {
  const all = demoRows[resource] || []
  const page = Number(params.page || 1); const pageSize = Number(params.pageSize || 10)
  const keyword = String(params.keyword || '').trim().toLowerCase()
  const filtered = all.filter((row) => {
    const date = String(row.created_at || row.start_time || '').slice(0, 10)
    return (!keyword || JSON.stringify(row).toLowerCase().includes(keyword)) &&
      (!params.status || String(row.status) === String(params.status)) &&
      (!params.orderType || row.order_type === params.orderType) &&
      (!params.startDate || date >= params.startDate) &&
      (!params.endDate || date <= params.endDate)
  })
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: filtered.length }
}

export const adminApi = {
  health: () => isDemoToken() ? Promise.resolve({ status: 'up', database: 'demo', timestamp: new Date().toISOString() }) : http.get('/health').then(unwrap),
  login: (payload) => {
    if (demoEnabled && payload.username === demoUsername && payload.password === demoPassword) return Promise.resolve({ accessToken: demoToken, admin: { adminId: 0, username: demoUsername, role: 'super_admin' } })
    return http.post('/auth/admin-login', payload).then(unwrap)
  },
  me: () => isDemoToken() ? Promise.resolve({ adminId: 0, username: demoUsername, role: 'super_admin' }) : http.get('/auth/admin-me').then(unwrap),
  dashboard: () => isDemoToken() ? Promise.resolve(demoOverview) : http.get('/admin/dashboard').then(unwrap),
  vehicles: (params = {}) => isDemoToken() ? Promise.resolve(demoList('vehicles', params)) : http.get('/admin/vehicles', { params }).then(unwrap),
  stations: (params = {}) => isDemoToken() ? Promise.resolve(demoList('stations', params)) : http.get('/admin/stations', { params }).then(unwrap),
  orders: (params = {}) => isDemoToken() ? Promise.resolve(demoList('orders', params)) : http.get('/admin/orders', { params }).then(unwrap),
  products: (params = {}) => isDemoToken() ? Promise.resolve(demoList('products', params)) : http.get('/admin/products', { params }).then(unwrap),
  community: (params = {}) => isDemoToken() ? Promise.resolve(demoList('community', params)) : http.get('/admin/community/posts', { params }).then(unwrap),
  repairs: (params = {}) => isDemoToken() ? Promise.resolve(demoList('repairs', params)) : http.get('/admin/repairs', { params }).then(unwrap)
  ,users: (params = {}) => isDemoToken() ? Promise.resolve(demoList('users', params)) : http.get('/admin/users', { params }).then(unwrap)
  ,updateUserStatus: (id, status) => {
    if (isDemoToken()) { const row = demoUsers.find((item) => item.user_id === id); if (row) row.status = status; return Promise.resolve({ userId: id, status }) }
    return http.patch(`/admin/users/${id}/status`, { status }).then(unwrap)
  }
  ,merchants: (params = {}) => isDemoToken() ? Promise.resolve(demoList('merchants', params)) : http.get('/admin/merchants', { params }).then(unwrap)
  ,updateMerchant: (id, payload) => {
    if (isDemoToken()) { const row = demoMerchants.find((item) => item.merchant_id === id); if (row) { Object.assign(row, payload); if (payload.merchantType) row.merchant_type = payload.merchantType } return Promise.resolve({ merchantId: id, ...payload }) }
    return http.patch(`/admin/merchants/${id}`, payload).then(unwrap)
  }
  ,admins: () => isDemoToken() ? Promise.resolve([{ admin_id: 0, username: demoUsername, role: 'super_admin', status: 1, created_at: new Date().toISOString() }]) : http.get('/admin/admins').then(unwrap)
  ,createAdmin: (payload) => isDemoToken() ? Promise.resolve({ adminId: -1, ...payload }) : http.post('/admin/admins', payload).then(unwrap)
  ,updateAdminStatus: (id, status) => isDemoToken() ? Promise.resolve({ adminId: id, status }) : http.patch(`/admin/admins/${id}/status`, { status }).then(unwrap)
  ,updateVehicle: (id, payload) => { if (isDemoToken()) { const row = demoVehicles.find((item) => item.vehicle_id === id); if (row) { Object.assign(row, payload); if (payload.batteryLevel !== undefined) row.battery_level = payload.batteryLevel } return Promise.resolve({ vehicleId: id, ...payload }) } return http.patch(`/admin/vehicles/${id}`, payload).then(unwrap) }
  ,createVehicle: (payload) => { if (isDemoToken()) { const id = Math.max(...demoVehicles.map((item) => item.vehicle_id)) + 1; demoVehicles.push({ vehicle_id: id, bike_number: payload.bikeNumber, model_name: 'T87D', color_name: '珍珠白', status: payload.status || 'available', battery_level: Number(payload.batteryLevel || 100), total_mileage: 0 }); return Promise.resolve({ vehicleId: id }) } return http.post('/admin/vehicles', payload).then(unwrap) }
  ,updateStation: (id, payload) => { if (isDemoToken()) { const row = demoStations.find((item) => item.zone_id === id); if (row) Object.assign(row, payload); return Promise.resolve({ zoneId: id, ...payload }) } return http.patch(`/admin/stations/${id}`, payload).then(unwrap) }
  ,updateProduct: (id, payload) => { if (isDemoToken()) { const row = demoProducts.find((item) => item.product_id === id); if (row) { Object.assign(row, payload); if (payload.priceCents !== undefined) row.price_cents = payload.priceCents } return Promise.resolve({ productId: id, ...payload }) } return http.patch(`/admin/products/${id}`, payload).then(unwrap) }
  ,updatePost: (id, payload) => { if (isDemoToken()) { const row = demoPosts.find((item) => item.post_id === id); if (row) Object.assign(row, payload); return Promise.resolve({ postId: id, ...payload }) } return http.patch(`/admin/community/posts/${id}/status`, payload).then(unwrap) }
  ,updateRepair: (id, payload) => { if (isDemoToken()) { const row = demoRepairs.find((item) => item.ticket_id === id); if (row) Object.assign(row, payload); return Promise.resolve({ ticketId: id, ...payload }) } return http.patch(`/admin/repairs/${id}`, payload).then(unwrap) }
  ,updateOrderStatus: (source, id, status) => { if (isDemoToken()) { const row = demoOrders.find((item) => item.source === source && item.order_id === id); if (row) row.status = status; return Promise.resolve({ source, orderId: id, status }) } return http.patch(`/admin/orders/${source}/${id}/status`, { status }).then(unwrap) }
}
