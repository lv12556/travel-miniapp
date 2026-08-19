// Shared, read-only content used by the main Tuneng experience.
// User interaction state remains inside TunengApp.vue.
export const assets = {
  bg: '/static/banners/home-background.png',
  banner1: '/static/banners/home-green-riding.png',
  banner2: '/static/banners/home-points.png',
  banner3: '/static/banners/home-first-ride.png',
}

export const products = [
  { name: '热血红', edition: 'STEN', image: '/static/products/vehicles/t87d-red.png', accent: '#e8392a', tag: '热销', bg: '#fff0ef' },
  { name: '极光粉', edition: 'Beauty', image: '/static/products/vehicles/t87d-pink.png', accent: '#e8439a', tag: '新品', bg: '#fff0f7' },
  { name: '星空蓝', edition: 'RACEFAST', image: '/static/products/vehicles/t87d-blue.png', accent: '#0aacbb', tag: '限量', bg: '#eafafb' },
  { name: '皓月白', edition: 'RACEFAST', image: '/static/products/vehicles/t87d-white.png', accent: '#1a7a4a', tag: '经典', bg: '#eff8f1' },
]

export const banners = [
  { image: assets.banner1, tag: '绿色骑行', title: '绿色骑行季', copy: '骑上途能，发现城市里的\n绿色风景', action: '立即参与' },
  { image: assets.banner2, tag: '碳积分商城', title: '骑行有价值，\n好礼随心兑', copy: '累计绿色里程，解锁专属权益', action: '立即兑换' },
  { image: assets.banner3, tag: '新人专享', title: '首骑免费\n开启绿色出行', copy: '新用户注册即享首次骑行福利', action: '立即领取' },
]

export const quickActions = [
  { label: '扫码用车', color: '#2aad6a' },
  { label: '整车选购', color: '#4aade8' },
  { label: '配件商城', color: '#f5c842' },
  { label: '碳积分', color: '#a78bfa' },
]

export const nearbySpots = [
  { name: '南禅寺牌楼', count: 5, dist: '120m' },
  { name: '古运河停车点', count: 3, dist: '280m' },
  { name: '清名桥', count: 8, dist: '450m' },
]

export const plans = [
  {
    id: 'hour', name: '次卡', price: '¥2', unit: '/次', validity: '单次有效', badge: '新用户免费',
    benefits: ['骑行30分钟内计费', '超时¥0.5/5分钟', '支持临时还车', '含保险保障']
  },
  {
    id: 'day', name: '日卡', price: '¥9.9', unit: '/天', validity: '当日24时前有效', badge: '热门',
    benefits: ['不限次数骑行', '单次最长2小时', '全城任意停车点', '含骑行意外险']
  },
  {
    id: 'month', name: '月卡', price: '¥59', unit: '/月', validity: '30天内有效', badge: '最划算',
    benefits: ['不限次数骑行', '单次最长4小时', '解锁VIP停车区', '碳积分×2倍', '含综合骑行险']
  },
]

export const mallItems = [
  { id: 1, icon: '▱', name: '骑行优惠券', desc: '单次租赁立减¥2', pts: 120, color: '#4aade8' },
  { id: 2, icon: '▣', name: '环保帆布袋', desc: '再生棉材质 · 限量款', pts: 380, color: '#2aad6a' },
  { id: 3, icon: '✦', name: '骑行月卡', desc: '30天不限次骑行', pts: 980, color: '#a78bfa' },
  { id: 4, icon: '♧', name: '碳中和证书', desc: '专属电子证书', pts: 500, color: '#f5c842' },
]

export const records = [
  { date: '07月25日', time: '08:32', route: '南禅寺 → 崇安寺', km: '5.2', pts: '+52', carbon: '318g' },
  { date: '07月24日', time: '17:48', route: '清名桥 → 古运河', km: '3.8', pts: '+38', carbon: '233g' },
  { date: '07月23日', time: '09:15', route: '南禅寺 → 蠡湖公园', km: '7.1', pts: '+71', carbon: '435g' },
]

export const badges = [
  { image: '/static/badges/badge-sprout.png', label: '绿色萌芽', desc: '完成首次骑行', on: true },
  { image: '/static/badges/badge-journey.png', label: '低碳启程', desc: '累计骑行10km', on: true },
  { image: '/static/badges/badge-rider.png', label: '绿色骑士', desc: '减碳超过1kg', on: true },
  { image: '/static/badges/badge-pioneer.png', label: '低碳先锋', desc: '累计骑行100km' },
  { image: '/static/badges/badge-master.png', label: '碳能达人', desc: '等效植树5棵' },
  { image: '/static/badges/badge-solar.png', label: '太阳能守护者', desc: '减碳超1吨' },
]
