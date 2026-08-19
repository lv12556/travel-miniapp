<script setup>
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { assets, badges, banners, mallItems, nearbySpots, plans, products, quickActions } from '../data/tuneng'
import { getStoredToken, getStoredUser, loginWithWechat, logout as clearLogin } from '../services/auth'
import { requestWithRetry } from '../services/request'
import { useToast } from 'wot-design-uni'
import { TUNENG_CONTEXT_KEY } from '../context/tuneng-context'
import HomePage from './pages/HomePage.vue'
import RentalPage from './pages/RentalPage.vue'
import CarbonPage from './pages/CarbonPage.vue'
import ShopPage from './pages/ShopPage.vue'
import CommunityPage from './pages/CommunityPage.vue'
import ProfilePage from './pages/ProfilePage.vue'
import AsyncState from './common/AsyncState.vue'
import PaginationFooter from './common/PaginationFooter.vue'
import { previewUser, useUserStore } from '../stores/user'
import { useVehiclesStore } from '../stores/vehicles'
import { useOrdersStore } from '../stores/orders'
import { usePointsStore } from '../stores/points'

const userStore = useUserStore()
const vehiclesStore = useVehiclesStore()
const ordersStore = useOrdersStore()
const pointsStore = usePointsStore()
const { profile: user, isLoggedIn, loading: loginLoading, sessionExpired } = storeToRefs(userStore)
const { nearbyVehicles, stations, loading: vehiclesLoading, error: vehiclesError } = storeToRefs(vehiclesStore)
const { purchaseOrders: purchasedOrders, rideHistory, loading: ordersLoading, error: ordersError, hasMore: ordersHasMore } = storeToRefs(ordersStore)
const { redeemed, balance: pointsBalance, loading: pointsLoading, error: pointsError, hasMore: pointsHasMore, transactions: pointTransactions } = storeToRefs(pointsStore)

const activeTab = ref('home')
const bannerIndex = ref(0)
const productIndex = ref(0)
const carbonProgress = ref(0)
const plan = ref('day')
const carbonSubTab = ref('recommended')
const likedPosts = ref([])
const followedPosts = ref([])
const communityFavoritePostIds = ref([])
const communityPostDetailPage = ref(false)
const selectedCommunityPost = ref(null)
const communityCommentContent = ref('')
const communityComments = ref({
  1: [
    { id: 101, user: '城市慢骑者', avatar: '城', time: '8分钟前', content: '南禅寺这段路傍晚骑特别舒服，已收藏路线。' },
    { id: 102, user: '低碳生活家', avatar: '低', time: '5分钟前', content: '12 公里零电费太划算了，碳积分也很香！' },
  ],
  2: [
    { id: 201, user: '晨光骑手', avatar: '晨', time: '26分钟前', content: '这个日出太治愈了，绿色通勤从今天开始。' },
    { id: 202, user: '通勤小绿', avatar: '通', time: '18分钟前', content: '同款路线打卡，骑行上班心情会变好。' },
  ],
  3: [
    { id: 301, user: '零碳计划', avatar: '零', time: '42分钟前', content: '一起冲绿色先锋徽章，保持骑行！' },
  ],
})
const profilePanel = ref('')
const detailReturnPanel = ref('')
const detailPage = ref('')
const selectedItem = ref(null)
const profileEditPage = ref(false)
const settingsPage = ref('')
const profileDraft = ref({ nickname: '', avatar: '' })
const privacySettings = ref({ location: true, rides: true, recommendation: false })
const addressEntries = ref([
  { id: 1, label: '家', title: '梁溪区南长街', detail: '无锡市梁溪区南长街 88 号', active: true },
  { id: 2, label: '公司', title: '太湖新城办公区', detail: '无锡市滨湖区观山路 18 号', active: false },
])
const addressEditorPage = ref(false)
const addressDraft = ref({ label: '家', name: '', phone: '', region: '', detail: '' })
const orderFilter = ref('all')
const pointFilter = ref('all')
const repairDescription = ref('')
const repairType = ref('车辆无法开锁')
const repairPhotos = ref([])
const repairContact = ref('13800008888')
const repairVehicleId = ref('TN-20240725')
const scanVehicleId = ref('TN-20240725')
const selectedRepairTypes = ref([])
const repairPage = ref(false)
const repairRecordsPage = ref(false)
const repairRecordDetailPage = ref(false)
const selectedRepairRecord = ref(null)
const repairRecords = ref([
  { id: 1, date: '2026/08/12 09:20', vehicle: 'TN-20240725', type: '车辆无法启动 · 电池问题', status: '处理中', detail: '服务站已接单，预计 30 分钟内联系', contact: '138****8888', steps: ['已提交报修申请', '服务站已接单', '等待工程师联系'] },
  { id: 2, date: '2026/07/12 14:08', vehicle: 'TN-20240725', type: '常规保养', status: '已完成', detail: '完成刹车系统检查与太阳能面板检测', contact: '138****8888', steps: ['已提交保养申请', '服务站已接单', '已完成检修'] },
])
const rideSettlementPage = ref(false)
const rideInProgress = ref(true)
const latestRide = ref(null)
const locationPage = ref(false)
const notificationPage = ref(false)
const scanPage = ref(false)
const searchPage = ref(false)
const bannerPage = ref('')
const newUserCouponClaimed = ref(uni.getStorageSync('tuneng_new_user_coupon') === 'claimed')
const communityPostPage = ref(false)
const communityPostContent = ref('')
const communityPostPhotos = ref([])
const selectedNotification = ref(null)
const currentLocation = ref({ province: '江苏省', city: '无锡市' })
const selectedProvince = ref('江苏省')
const selectedCity = ref('无锡市')
const locationData = [
  { province: '北京市', cities: ['北京市'] }, { province: '上海市', cities: ['上海市'] },
  { province: '广东省', cities: ['广州市', '深圳市', '珠海市'] }, { province: '江苏省', cities: ['无锡市', '苏州市', '无锡市'] },
  { province: '浙江省', cities: ['杭州市', '宁波市', '温州市'] }, { province: '四川省', cities: ['成都市', '绵阳市'] },
  { province: '湖北省', cities: ['武汉市', '宜昌市'] }, { province: '湖南省', cities: ['长沙市', '株洲市'] },
  { province: '山东省', cities: ['济南市', '青岛市'] }, { province: '福建省', cities: ['福州市', '厦门市'] },
  { province: '河南省', cities: ['郑州市', '洛阳市'] }, { province: '陕西省', cities: ['西安市'] },
  { province: '云南省', cities: ['昆明市', '大理市'] }, { province: '辽宁省', cities: ['沈阳市', '大连市'] },
  { province: '安徽省', cities: ['合肥市', '芜湖市', '黄山市'] }, { province: '江西省', cities: ['南昌市', '九江市'] },
  { province: '广西壮族自治区', cities: ['南宁市', '桂林市'] }, { province: '海南省', cities: ['海口市', '三亚市'] },
  { province: '贵州省', cities: ['贵阳市', '遵义市'] }, { province: '甘肃省', cities: ['兰州市', '敦煌市'] },
  { province: '吉林省', cities: ['长春市', '吉林市'] }, { province: '黑龙江省', cities: ['哈尔滨市', '齐齐哈尔市'] },
  { province: '河北省', cities: ['石家庄市', '秦皇岛市'] }, { province: '山西省', cities: ['太原市', '大同市'] },
  { province: '内蒙古自治区', cities: ['呼和浩特市', '包头市'] }, { province: '新疆维吾尔自治区', cities: ['乌鲁木齐市', '喀什市'] },
  { province: '西藏自治区', cities: ['拉萨市'] }, { province: '青海省', cities: ['西宁市'] }, { province: '宁夏回族自治区', cities: ['银川市'] },
  { province: '重庆市', cities: ['重庆市'] }, { province: '天津市', cities: ['天津市'] }, { province: '香港特别行政区', cities: ['香港'] }, { province: '澳门特别行政区', cities: ['澳门'] }, { province: '台湾省', cities: ['台北市', '高雄市'] },
]
const notifications = ref([
  { id: 1, type: 'system', title: '骑行积分到账', time: '今天 08:32', summary: '本次骑行获得 52 pts', detail: '你于今天 08:32 完成了南禅寺到崇安寺的骑行，获得 52 碳积分，累计减碳 318g。', unread: true },
  { id: 2, type: 'service', title: '智能客服对话', time: '昨天 18:06', summary: '你的车辆故障问题已有回复', detail: '客服已收到你的车辆故障咨询，可继续在线描述问题，服务站会为你安排检测。', unread: true },
  { id: 3, type: 'activity', title: '绿色出行周挑战', time: '07月25日', summary: '完成 5 次骑行可得双倍积分', detail: '本周挑战还剩 2 天，完成 5 次骑行即可获得双倍碳积分奖励。', unread: true },
])
const selectedCities = computed(() => locationData.find(item => item.province === selectedProvince.value)?.cities || [])
const chatMessages = ref([])
const searchText = ref('')
const searchCatalog = [
  { id: 'scan', title: '扫码开锁', desc: '扫描车辆二维码后开锁', icon: '/static/icons/quick-scan.png', keywords: ['扫码', '开锁', '二维码', '车辆id', '车辆号', 'tn-20240725'] },
  { id: 'rental', title: '附近车辆与停车点', desc: '查看可用车辆、停车点和骑行订单', icon: '/static/icons/quick-bike.png', keywords: ['附近', '车辆', '租车', '骑行', '停车', '还车', '地图', '车位'] },
  { id: 'repair', title: '在线报修', desc: '提交车辆故障并联系服务站', icon: '/static/profile/service-repair.png', keywords: ['报修', '故障', '无法启动', '充电异常', '电池', '刹车', '轮胎', '灯光', '异响'] },
  { id: 'points', title: '碳积分兑换', desc: '查看积分余额并兑换骑行好礼', icon: '/static/icons/quick-carbon.png', keywords: ['积分', '碳积分', '兑换', '优惠券', '权益', '礼品'] },
  { id: 'accessories', title: '配件商城', desc: '选购头盔、车锁、骑行包等装备', icon: '/static/icons/quick-shop.png', keywords: ['配件', '头盔', '车锁', '骑行包', '补能灯', '装备'] },
  { id: 'vehicle', title: '整车选购', desc: '查看途能 T87D 车型和配色', icon: '/static/icons/quick-bike.png', keywords: ['整车', 't87d', '电动车', '车型', '购车', '太阳能车'] },
  { id: 'service', title: '智能客服', desc: '咨询租车、订单、积分和服务问题', icon: '/static/profile/service-chat.png', keywords: ['客服', '收费', '价格', '订单', '怎么用', '帮助', '规则'] },
]
const searchShortcuts = ['scan', 'rental', 'points', 'repair'].map(id => searchCatalog.find(item => item.id === id))
const searchResults = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  if (!query) return []
  return searchCatalog.filter(item => item.title.toLowerCase().includes(query) || item.keywords.some(keyword => keyword.includes(query) || query.includes(keyword)))
})
const hasUnread = computed(() => notifications.value.some(notification => notification.unread))
const displayedStats = ref({ points: 1, km: 1, trees: 1 })
const shopTab = ref('vehicles')
const purchasePage = ref(false)
const planPurchasePage = ref(false)
const purchaseType = ref('vehicle')
const purchaseItem = ref(null)
const purchaseColor = ref('极光粉')
const purchaseForm = ref({ name: '林小绿', phone: '13800008888', region: '江苏省 无锡市', address: '' })
const activeRideBenefit = ref(0)
const { show: showWotToast } = useToast()
const shopAccessories = [
  { id: 1, name: '轻量骑行头盔', desc: '一体成型 · 通风透气', price: '¥299', image: '/static/products/accessories/helmet.png', tag: '新品' },
  { id: 2, name: '防水骑行包', desc: '15L 容量 · 快拆固定', price: '¥169', image: '/static/products/accessories/waterproof-bag.png', tag: '精选' },
  { id: 3, name: '智能车锁', desc: '蓝牙解锁 · 异动提醒', price: '¥199', image: '/static/products/accessories/smart-lock.png', tag: '热销' },
  { id: 4, name: '户外补能灯', desc: 'USB-C 充电 · 三档亮度', price: '¥129', image: '/static/products/accessories/recharge-light.png', tag: '配件' },
]
let bannerTimer
let productTimer
let statsTimer
let carbonProgressTimer

const posts = ref([
  { id: 1, user: '骑行小队长', avatar: '骑', time: '10分钟前', content: '今天骑途能T87D去南禅寺，太阳能充电真的好用！全程12km零电费，碳积分+120，推荐大家试试🌿', image: '/static/community/community-1.png', tags: ['#骑行日记', '#碳积分'], likes: 248, comments: 32, color: '#1a7a4a' },
  { id: 2, user: '绿色通勤侠', avatar: '绿', time: '38分钟前', content: '上班路上用途能拍了个日出，绿色出行真的治愈💚 今日减碳318g，相当于种了半棵树🌳', image: '/static/community/community-2.png', tags: ['#绿色通勤', '#低碳生活'], likes: 189, comments: 17, color: '#4aade8' },
  { id: 3, user: '碳中和先锋', avatar: '碳', time: '1小时前', content: '本月已骑行86km，累计减碳5.27kg，离“绿色先锋”徽章只差0.73kg了！大家一起冲 💪', image: '/static/community/community-3.png', tags: ['#成就解锁', '#打卡挑战'], likes: 312, comments: 44, color: '#a78bfa' },
])
const productHeroImages = {
  '极光粉': '/static/products/vehicles/t87d-aurora-pink-card.png',
  '星空蓝': '/static/products/vehicles/t87d-starry-blue-card.png',
  '热血红': '/static/products/vehicles/t87d-passion-red-card.png',
  '皓月白': '/static/products/vehicles/t87d-moon-white-card.png',
}
const currentProduct = computed(() => {
  const product = products[productIndex.value]
  return { ...product, image: productHeroImages[product.name] }
})
const currentPlan = computed(() => plans.find((item) => item.id === plan.value) || plans[0])
const showPosts = computed(() => carbonSubTab.value === 'following' ? posts.value.filter(item => followedPosts.value.includes(item.id)) : posts.value)
const favoriteCommunityPosts = computed(() => posts.value.filter(item => communityFavoritePostIds.value.includes(item.id)))
const rideBenefits = computed(() => mallItems.filter(item => [1, 3].includes(item.id) && redeemed.value.includes(item.id)))
const purchaseProduct = computed(() => products.find(item => item.name === purchaseColor.value) || products[0])
const purchaseImage = computed(() => purchaseType.value === 'vehicle' ? productHeroImages[purchaseColor.value] : purchaseItem.value?.image)
const purchasePrice = computed(() => purchaseType.value === 'vehicle' ? '¥4,999' : purchaseItem.value?.price)

onMounted(() => {
  bannerTimer = setInterval(() => bannerIndex.value = (bannerIndex.value + 1) % banners.length, 3500)
  productTimer = setInterval(() => productIndex.value = (productIndex.value + 1) % products.length, 3000)
  animateCarbonProgress()
  userStore.bootstrap().catch(() => {})
  vehiclesStore.loadNearby().catch(() => {})
  if (getStoredToken()) {
    ordersStore.loadRideHistory().catch(() => {})
    pointsStore.loadSummary().catch(() => {})
    pointsStore.loadTransactions().catch(() => {})
  }
})
onBeforeUnmount(() => { clearInterval(bannerTimer); clearInterval(productTimer); clearInterval(statsTimer); clearInterval(carbonProgressTimer) })
function toast(title) {
  if (title === '历史行程加载中') return openPanel('rides')
  if (title === '积分明细加载中') return openDetail('points')
  if (title === '会员权益') return openDetail('benefits')
  showWotToast({ msg: title, duration: 1800 })
  return
  uni.showToast({ title, icon: 'none' })
}
function formatStat(value) { return Number(value).toLocaleString('en-US') }
function animateStats() {
  clearInterval(statsTimer)
  const targets = {
    points: Math.max(1, Number(user.value?.points) || 8620),
    km: Math.max(1, Number(user.value?.total_km) || 247),
    trees: Math.max(1, Number(user.value?.trees) || 12),
  }
  const startedAt = Date.now()
  displayedStats.value = { points: 1, km: 1, trees: 1 }
  statsTimer = setInterval(() => {
    const progress = Math.min((Date.now() - startedAt) / 900, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayedStats.value = {
      points: Math.round(1 + (targets.points - 1) * eased),
      km: Math.round(1 + (targets.km - 1) * eased),
      trees: Math.round(1 + (targets.trees - 1) * eased),
    }
    if (progress === 1) clearInterval(statsTimer)
  }, 16)
}
function animateCarbonProgress() {
  clearInterval(carbonProgressTimer)
  const startedAt = Date.now()
  carbonProgress.value = 0
  carbonProgressTimer = setInterval(() => {
    const progress = Math.min((Date.now() - startedAt) / 900, 1)
    carbonProgress.value = Math.round(68 * (1 - Math.pow(1 - progress, 3)))
    if (progress === 1) clearInterval(carbonProgressTimer)
  }, 16)
}
function setTab(tab) { activeTab.value = tab; profilePanel.value = ''; detailPage.value = ''; repairPage.value = false; repairRecordsPage.value = false; locationPage.value = false; notificationPage.value = false; scanPage.value = false; searchPage.value = false; bannerPage.value = ''; communityPostPage.value = false; purchasePage.value = false; planPurchasePage.value = false; selectedNotification.value = null; if (tab === 'carbon' || tab === 'profile') animateStats(); if (tab === 'home') animateCarbonProgress() }
async function handleWechatLogin() {
  if (loginLoading.value) return
  try {
    await userStore.login()
    toast('微信登录成功')
  } catch (error) {
    uni.showModal({ title: '微信登录', content: error?.message || '登录失败，请稍后重试', showCancel: false })
  }
}
function handleLogout() {
  userStore.logout()
  profilePanel.value = ''
  detailPage.value = ''
  toast('当前为已登录预览模式')
}
function requireLogin() { return true }
function chooseBanner(index) { bannerIndex.value = index }
function chooseProduct(index) { productIndex.value = index }
function onProductChange(event) { productIndex.value = event.detail.current }
function openShop(tab = 'vehicles') { shopTab.value = tab; activeTab.value = 'shop'; profilePanel.value = ''; detailPage.value = ''; bannerPage.value = ''; purchasePage.value = false }
function openPurchase(type, item = null) {
  purchaseType.value = type
  purchaseItem.value = type === 'vehicle' ? null : item
  purchaseColor.value = currentProduct.value.name
  purchaseForm.value = { name: user.value.nickname || '林小绿', phone: '13800008888', region: `${currentLocation.value.province} ${currentLocation.value.city}`, address: '' }
  purchasePage.value = true
}
function closePurchase() { purchasePage.value = false }
function openPlanPurchase() { planPurchasePage.value = true }
function closePlanPurchase() { planPurchasePage.value = false }
function startPlanPayment() {
  const orderNo = `TP${Date.now().toString().slice(-10)}`
  // #ifdef MP-WEIXIN
  // Replace this payload with the signed prepay result returned by the payment backend.
  const paymentParams = null
  if (!paymentParams) return toast('套餐订单已创建，请接入服务端预支付签名后调起微信支付')
  uni.requestPayment({ ...paymentParams, success: () => { planPurchasePage.value = false; toast('支付成功，套餐已到账') }, fail: error => { if (!String(error?.errMsg || '').includes('cancel')) toast('微信支付未完成，请稍后重试') } })
  // #endif
  // #ifndef MP-WEIXIN
  toast(`套餐订单 ${orderNo} 已创建，请在微信小程序内完成微信支付`)
  // #endif
}
async function submitPurchase() {
  const form = purchaseForm.value
  if (getStoredToken()) {
    try {
      await requestWithRetry({
        url: '/commerce/orders',
        method: 'POST',
        auth: true,
        data: {
          orderType: purchaseType.value,
          items: [{
            productName: purchaseType.value === 'vehicle' ? `T87D · ${purchaseColor.value}` : purchaseItem.value.name,
            skuLabel: purchaseType.value === 'vehicle' ? purchaseProduct.value.edition : purchaseItem.value.desc,
            unitPriceCents: Math.round(Number(String(purchasePrice.value).replace(/[^0-9.]/g, '')) * 100),
            imageUrl: purchaseImage.value,
          }],
        },
      })
    } catch (error) { return toast(error?.message || '订单提交失败，请重试') }
  }
  if (!form.name.trim()) return toast('请填写收货人姓名')
  if (!/^1\d{10}$/.test(form.phone)) return toast('请输入正确的手机号')
  if (!form.address.trim()) return toast('请填写详细收货地址')
  ordersStore.addPurchaseOrder({ id: `TN${Date.now().toString().slice(-8)}`, title: purchaseType.value === 'vehicle' ? `途能 T87D · ${purchaseColor.value}` : purchaseItem.value.name, subtitle: purchaseType.value === 'vehicle' ? `${purchaseColor.value} · ${purchaseProduct.value.edition}` : purchaseItem.value.desc, price: purchasePrice.value, image: purchaseImage.value, type: purchaseType.value })
  purchasePage.value = false
  toast('订单提交成功，我们将尽快安排发货')
}
function openQuickAction(index) { if (index === 0) setTab('rental'); else if (index === 1) openShop('vehicles'); else if (index === 2) openShop('accessories'); else setTab('carbon') }
async function refreshNearbyVehicles() {
  try {
    await vehiclesStore.refresh()
    toast('已刷新附近车辆')
  } catch (error) { toast(error?.message || '附近车辆加载失败，请重试') }
}
function loadMoreRideHistory() { return ordersStore.loadMoreRideHistory() }
function loadMorePointTransactions() { return pointsStore.loadMoreTransactions() }
async function openNotifications() {
  profilePanel.value = ''; detailPage.value = ''; repairPage.value = false; repairRecordsPage.value = false; locationPage.value = false; selectedNotification.value = null; notificationPage.value = true
  if (getStoredToken()) {
    try {
      const result = await requestWithRetry({ url: '/notifications?page=1&pageSize=20', auth: true })
      notifications.value = (result?.items || []).map(item => ({ id: item.notification_id, type: item.notification_type, title: item.title, time: item.created_at, summary: item.summary, detail: item.detail, unread: !item.is_read }))
    } catch (error) { toast(error?.message || '通知加载失败，请重试') }
  }
}
function closeNotificationPage() { notificationPage.value = false; selectedNotification.value = null }
function handleNotificationBack() { if (selectedNotification.value) selectedNotification.value = null; else closeNotificationPage() }
async function openNotification(item) {
  item.unread = false; selectedNotification.value = item
  if (getStoredToken() && item.id) requestWithRetry({ url: `/notifications/${item.id}/read`, method: 'PATCH', auth: true }).catch(() => {})
}
function openLocationPage() { profilePanel.value = ''; detailPage.value = ''; repairPage.value = false; repairRecordsPage.value = false; notificationPage.value = false; selectedProvince.value = currentLocation.value.province; selectedCity.value = currentLocation.value.city; locationPage.value = true }
function selectProvince(province) { selectedProvince.value = province; selectedCity.value = locationData.find(item => item.province === province)?.cities[0] || '' }
function selectCity(city) { selectedCity.value = city; currentLocation.value = { province: selectedProvince.value, city }; locationPage.value = false; toast(`已切换至 ${selectedProvince.value.replace('省', '').replace('市', '')} · ${city.replace('市', '')}`) }
function openProduct(index) { productIndex.value = index; openShop('vehicles') }
function goProduct(delta) { productIndex.value = (productIndex.value + delta + products.length) % products.length }
function toggleRedeem(id) {
  if (redeemed.value.includes(id)) return
  const item = mallItems.find(value => value.id === id)
  if (!item) return
  if (!pointsStore.redeem(item, amount => userStore.spendPoints(amount))) return toast('当前碳积分不足')
  pointsStore.balance = Number(user.value.points || 0)
  toast([1, 3].includes(id) ? `${item.name}已存入我的权益` : '兑换成功，已存入权益包')
}
function useRideBenefit(item) { activeRideBenefit.value = item.id; openScanPage() }
async function toggleLike(post) {
  if (getStoredToken()) {
    try { await requestWithRetry({ url: `/community/posts/${post.id}/reactions`, method: 'POST', auth: true, data: { type: 'like' } }) }
    catch (error) { return toast(error?.message || '点赞失败，请重试') }
  }
  const index = likedPosts.value.indexOf(post.id); if (index === -1) { likedPosts.value.push(post.id); post.likes += 1 } else { likedPosts.value.splice(index, 1); post.likes -= 1 }
}
function openCommunityPostDetail(post) {
  profilePanel.value = ''
  detailPage.value = ''
  communityPostPage.value = false
  selectedCommunityPost.value = post
  communityCommentContent.value = ''
  communityPostDetailPage.value = true
}
function closeCommunityPostDetail() { communityPostDetailPage.value = false; selectedCommunityPost.value = null; communityCommentContent.value = '' }
async function toggleCommunityFavorite(post) {
  if (getStoredToken()) {
    try { await requestWithRetry({ url: `/community/posts/${post.id}/reactions`, method: 'POST', auth: true, data: { type: 'favorite' } }) }
    catch (error) { return toast(error?.message || '收藏失败，请重试') }
  }
  const index = communityFavoritePostIds.value.indexOf(post.id)
  if (index === -1) { communityFavoritePostIds.value.push(post.id); toast('已收藏到我的收藏') }
  else { communityFavoritePostIds.value.splice(index, 1); toast('已取消收藏') }
}
async function submitCommunityComment() {
  const content = communityCommentContent.value.trim()
  const post = selectedCommunityPost.value
  if (!content || !post) return
  if (getStoredToken()) {
    try { await requestWithRetry({ url: `/community/posts/${post.id}/comments`, method: 'POST', auth: true, data: { content } }) }
    catch (error) { return toast(error?.message || '评论失败，请重试') }
  }
  if (!communityComments.value[post.id]) communityComments.value[post.id] = []
  communityComments.value[post.id].push({ id: Date.now(), user: user.value?.nickname || '林小绿', avatar: (user.value?.nickname || '绿').slice(0, 1), time: '刚刚', content })
  post.comments += 1
  communityCommentContent.value = ''
  toast('评论已发布')
}
function openFavoriteCommunityPost(post) { activeTab.value = 'community'; openCommunityPostDetail(post) }
function toggleFollow(id) { const index = followedPosts.value.indexOf(id); if (index === -1) followedPosts.value.push(id); else followedPosts.value.splice(index, 1) }
function openScanPage() { profilePanel.value = ''; detailPage.value = ''; repairPage.value = false; repairRecordsPage.value = false; locationPage.value = false; notificationPage.value = false; purchasePage.value = false; planPurchasePage.value = false; scanPage.value = true }
function closeScanPage() { scanPage.value = false }
function openSearchPage() { profilePanel.value = ''; detailPage.value = ''; repairPage.value = false; repairRecordsPage.value = false; locationPage.value = false; notificationPage.value = false; scanPage.value = false; searchText.value = ''; searchPage.value = true }
function closeSearchPage() { searchPage.value = false; searchText.value = '' }
function openBanner(index) {
  if (index === 1) return openShop('points')
  profilePanel.value = ''; detailPage.value = ''; repairPage.value = false; repairRecordsPage.value = false; locationPage.value = false; notificationPage.value = false; scanPage.value = false; searchPage.value = false
  communityPostPage.value = false
  bannerPage.value = index === 0 ? 'season' : 'newUser'
}
function closeBannerPage() { bannerPage.value = '' }
function openCommunityPost() { bannerPage.value = ''; profilePanel.value = ''; detailPage.value = ''; repairPage.value = false; repairRecordsPage.value = false; locationPage.value = false; notificationPage.value = false; scanPage.value = false; searchPage.value = false; communityPostContent.value = ''; communityPostPhotos.value = []; communityPostPage.value = true }
function closeCommunityPost() { communityPostPage.value = false }
function chooseCommunityPostPhotos() {
  const remaining = 6 - communityPostPhotos.value.length
  if (remaining <= 0) return
  uni.chooseImage({ count: remaining, sizeType: ['compressed'], sourceType: ['album', 'camera'], success: result => communityPostPhotos.value.push(...result.tempFilePaths) })
}
function removeCommunityPostPhoto(index) { communityPostPhotos.value.splice(index, 1) }
async function submitCommunityPost() {
  const content = communityPostContent.value.trim()
  if (!content) return toast('写点骑行分享再发布吧')
  if (getStoredToken()) {
    try {
      await requestWithRetry({ url: '/community/posts', method: 'POST', auth: true, data: { content, imageUrls: communityPostPhotos.value, tags: ['#绿色骑行季#'] } })
    } catch (error) { return toast(error?.message || '发布失败，请重试') }
  }
  posts.value.unshift({ id: Date.now(), user: user.value?.nickname || '林小绿', avatar: (user.value?.nickname || '绿').slice(0, 1), time: '刚刚', content, image: communityPostPhotos.value[0] || '/static/community/community-1.png', tags: ['#绿色骑行季#'], likes: 0, comments: 0, color: '#1a7a4a' })
  communityPostPage.value = false
  activeTab.value = 'community'
  carbonSubTab.value = 'recommended'
  toast('发布成功，已参与绿色骑行季')
}
function claimNewUserCoupon() {
  if (newUserCouponClaimed.value) return openScanPage()
  newUserCouponClaimed.value = true
  uni.setStorageSync('tuneng_new_user_coupon', 'claimed')
  toast('首骑免费券已领取，可在我的权益中查看')
}
function openSearchResult(item) {
  closeSearchPage()
  if (item.id === 'scan') return openScanPage()
  if (item.id === 'rental') return setTab('rental')
  if (item.id === 'repair') { setTab('profile'); return openRepairForm() }
  if (item.id === 'points' || item.id === 'accessories' || item.id === 'vehicle') return openShop(item.id === 'vehicle' ? 'vehicles' : item.id)
  if (item.id === 'service') { openNotifications(); const serviceNotification = notifications.value.find(notification => notification.type === 'service'); if (serviceNotification) openNotification(serviceNotification) }
}
function completeScan(value) {
  const vehicleId = String(value || '').trim()
  if (!vehicleId) return toast('请输入车辆 ID')
  repairVehicleId.value = vehicleId
  scanVehicleId.value = vehicleId
  scanPage.value = false
  rideInProgress.value = true
  latestRide.value = null
  activeTab.value = 'rental'
  const benefit = mallItems.find(item => item.id === activeRideBenefit.value)
  toast(benefit?.id === 1 ? '骑行优惠券已生效，本次租赁自动立减 ¥2' : benefit?.id === 3 ? '骑行月卡已生效，已享受月卡权益' : newUserCouponClaimed.value ? '首骑券已生效，订单结算自动立减 ¥6' : `已识别车辆 ${vehicleId}`)
}
function scan() {
  // H5 has no dependable native scanner, so expose a testable scan surface on desktop.
  // #ifdef H5
  openScanPage()
  return
  // #endif
  uni.scanCode({
    onlyFromCamera: true,
    scanType: ['qrCode'],
    success: result => completeScan(result.result),
    fail: error => { if (!String(error?.errMsg || '').includes('cancel')) toast('未识别到二维码，请重试') },
  })
}
function openPanel(panel) { if (!requireLogin('查看个人服务')) return; detailReturnPanel.value = ''; profilePanel.value = panel; detailPage.value = ''; selectedItem.value = null }
function openProfileEdit() {
  profileDraft.value = { nickname: user.value?.nickname || '微信用户', avatar: user.value?.avatar || '' }
  profileEditPage.value = true
}
function closeProfileEdit() { profileEditPage.value = false }
function chooseProfileAvatar() { uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'], success: result => profileDraft.value.avatar = result.tempFilePaths[0] }) }
async function saveProfileEdit() {
  const nickname = profileDraft.value.nickname.trim()
  if (!nickname) return toast('请输入昵称')
  try {
    await userStore.saveProfile({ nickname, avatar: profileDraft.value.avatar })
    profileEditPage.value = false
    toast('个人资料已保存')
  } catch (error) { toast(error?.message || '个人资料保存失败，请重试') }
}
function openSettingsPage(page) { profilePanel.value = ''; detailPage.value = ''; settingsPage.value = page }
function closeSettingsPage() { settingsPage.value = '' }
function setDefaultAddress(id) { addressEntries.value = addressEntries.value.map(item => ({ ...item, active: item.id === id })); toast('已设为默认地址') }
function addAddress() {
  addressDraft.value = { label: '家', name: user.value?.nickname || '林小绿', phone: '13800008888', region: `${currentLocation.value.province} ${currentLocation.value.city}`, detail: '' }
  addressEditorPage.value = true
}
function closeAddressEditor() { addressEditorPage.value = false }
function saveAddress() {
  const draft = addressDraft.value
  if (!draft.name.trim()) return toast('请填写收货人姓名')
  if (!/^1\d{10}$/.test(draft.phone)) return toast('请输入正确的手机号')
  if (!draft.region.trim() || !draft.detail.trim()) return toast('请填写完整地址')
  const id = Date.now()
  addressEntries.value = [{ id, label: draft.label || '家', title: `${draft.region} ${draft.detail}`, detail: `${draft.name} · ${draft.phone}`, active: true }, ...addressEntries.value.map(item => ({ ...item, active: false }))]
  addressEditorPage.value = false
  toast('地址已保存')
}
function openRepairForm() { profilePanel.value = ''; detailPage.value = ''; selectedItem.value = null; repairRecordsPage.value = false; repairPage.value = true }
function closeRepairPage() { repairPage.value = false }
function openRepairRecordsPage() { profilePanel.value = ''; detailPage.value = ''; repairPage.value = false; repairRecordsPage.value = true; locationPage.value = false; notificationPage.value = false }
function closeRepairRecordsPage() { repairRecordsPage.value = false }
function openRepairRecordDetail(item) { selectedRepairRecord.value = item; repairRecordDetailPage.value = true }
function closeRepairRecordDetail() { repairRecordDetailPage.value = false; selectedRepairRecord.value = null }
function openDetail(page, item = null) {
  if (page === 'repairForm') return openRepairForm()
  if (page === 'repairRecords') return openRepairRecordsPage()
  detailReturnPanel.value = profilePanel.value
  profilePanel.value = ''
  detailPage.value = page
  selectedItem.value = item
}
function closeDetail() {
  const returnPanel = detailReturnPanel.value
  detailPage.value = ''
  selectedItem.value = null
  detailReturnPanel.value = ''
  if (returnPanel) profilePanel.value = returnPanel
}
function chooseRepairPhoto() {
  const remaining = 3 - repairPhotos.value.length
  if (remaining <= 0) return toast('最多上传 3 张照片')
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    success: (result) => { repairPhotos.value.push(...result.tempFilePaths) },
  })
}
function removeRepairPhoto(index) { repairPhotos.value.splice(index, 1) }
function toggleRepairType(type) {
  const index = selectedRepairTypes.value.indexOf(type)
  if (index === -1) selectedRepairTypes.value.push(type)
  else selectedRepairTypes.value.splice(index, 1)
}
async function submitRepair() {
  if (!repairVehicleId.value.trim()) return toast('请输入车辆 ID')
  if (!selectedRepairTypes.value.length) return toast('请选择故障类型')
  if (!repairDescription.value.trim()) return toast('请先填写故障描述')
  if (!/^1\d{10}$/.test(repairContact.value)) return toast('请输入正确的联系电话')
  if (getStoredToken()) {
    try {
      await requestWithRetry({ url: '/community/repairs', method: 'POST', auth: true, data: { vehicleIdentifier: repairVehicleId.value.trim(), issueTypes: selectedRepairTypes.value, description: repairDescription.value.trim(), contactPhone: repairContact.value, photoUrls: repairPhotos.value } })
    } catch (error) { return toast(error?.message || '报修提交失败，请重试') }
  }
  repairRecords.value.unshift({
    id: Date.now(),
    date: '刚刚',
    vehicle: repairVehicleId.value.trim(),
    type: selectedRepairTypes.value.join(' · '),
    status: '处理中',
    detail: repairDescription.value.trim(),
    contact: `${repairContact.value.slice(0, 3)}****${repairContact.value.slice(-4)}`,
    steps: ['已提交报修申请', '等待服务站接单', '工程师将联系你'],
  })
  repairDescription.value = ''
  repairPhotos.value = []
  selectedRepairTypes.value = []
  repairPage.value = false
  toast('报修申请已提交')
}
function openRideSettlement() { if (rideInProgress.value) rideSettlementPage.value = true }
function closeRideSettlement() { rideSettlementPage.value = false }
function confirmEndRide() {
  latestRide.value = { id: Date.now(), date: '今天', route: '南禅寺牌楼 → 崇安寺', time: '14:07 - 14:31', km: '4.2 km', fee: '¥2.40', pts: '+18', carbon: '110 g' }
  rideHistory.value.unshift(latestRide.value)
  userStore.addPoints(18)
  user.value = { ...user.value, total_km: Number(user.value?.total_km || 247) + 4.2 }
  pointsStore.balance = Number(user.value.points || 0)
  rideInProgress.value = false
  rideSettlementPage.value = false
  toast('骑行已结束，订单已生成')
}
function askService(text) { chatMessages.value.push({ role: 'user', text }); setTimeout(() => chatMessages.value.push({ role: 'bot', text: text === '车辆故障' ? '请先确认车辆编号和故障现象，在线报修会为你安排最近的服务站。' : text === '积分兑换' ? '积分兑换成功后会自动存入权益包，可在订单或碳资产页查看。' : '租赁按实际骑行时长计费，临时锁车不结束订单。' }), 250) }
function openRideHistory() { openPanel('rides') }
function openPointsLedger() { openDetail('points') }
function openMemberBenefits() { openDetail('benefits') }
const detailTitle = computed(() => ({
  points: '积分明细', benefits: '我的权益', level: '会员等级权益', carbonWallet: '碳积分钱包', vehicleDetail: '车辆详情', favoriteDetail: '收藏详情',
  repairForm: '在线报修', repairRecords: '维修记录', rideDetail: '骑行详情', rideOrder: '骑行订单详情', purchaseOrder: '整车订单详情', accessoryOrder: '配件订单详情', dynamicPurchaseOrder: '购买订单详情',
}[detailPage.value] || ''))
const panelContent = computed(() => ({
  orders: { title: '我的订单', rows: [['TN202608120001', 'T87D 太阳能助力车', '待收货'], ['TN202608120004', '南禅寺 → 崇安寺 · 12.4 km', '已完成']] },
  wallet: { title: '碳积分钱包', image: '', rows: [['当前可用积分', '8,620 pts', '黄金骑士'], ['今日骑行奖励', '+862 pts', '已到账'], ['积分兑换记录', '骑行优惠券', '已使用']] },
  vehicle: { title: '我的车辆', rows: [['途能 T87D', '皓月白 · 标准版', '车辆健康良好'], ['太阳能补能', '今日已补能 1.8 kWh', '运行正常']] },
  favorites: { title: '我的收藏', image: '', rows: [] },
  repair: { title: '在线报修', rows: [['车辆故障报修', '填写故障类型与描述', '立即提交'], ['维修记录', '上次保养：2026/07/12', '查看记录']] },
  service: { title: '智能客服', image: '', rows: [['途能小助手', '您好，请问有什么可以帮您？', '在线'], ['常见问题', '租赁、充电、售后服务', '查看全部']] },
  rides: { title: '骑行记录', rows: [['2026/08/12', '南禅寺 → 崇安寺 · 36分钟', '12.4 km'], ['2026/08/05', '清名桥 → 古运河 · 27分钟', '6.8 km']] }
})[profilePanel.value] || { title: '', image: '', rows: [] })

provide(TUNENG_CONTEXT_KEY, { activeTab, bannerIndex, productIndex, carbonProgress, plan, carbonSubTab, redeemed, likedPosts, followedPosts, communityFavoritePostIds, communityPostDetailPage, selectedCommunityPost, communityCommentContent, communityComments, profilePanel, detailReturnPanel, detailPage, selectedItem, profileEditPage, settingsPage, profileDraft, privacySettings, addressEntries, addressEditorPage, addressDraft, orderFilter, pointFilter, repairDescription, repairType, repairPhotos, repairContact, repairVehicleId, scanVehicleId, selectedRepairTypes, repairPage, repairRecordsPage, repairRecordDetailPage, selectedRepairRecord, repairRecords, rideSettlementPage, rideInProgress, latestRide, locationPage, notificationPage, scanPage, searchPage, bannerPage, newUserCouponClaimed, communityPostPage, communityPostContent, communityPostPhotos, selectedNotification, currentLocation, selectedProvince, selectedCity, locationData, notifications, selectedCities, chatMessages, searchText, searchCatalog, searchShortcuts, searchResults, hasUnread, displayedStats, previewUser, isLoggedIn, user, loginLoading, shopTab, purchasePage, planPurchasePage, purchaseType, purchaseItem, purchaseColor, purchaseForm, purchasedOrders, activeRideBenefit, rideHistory, vehiclesLoading, vehiclesError, nearbyVehicles, stations, ordersLoading, ordersError, ordersHasMore, pointsBalance, pointsLoading, pointsError, pointsHasMore, pointTransactions, showWotToast, shopAccessories, bannerTimer, productTimer, statsTimer, carbonProgressTimer, posts, productHeroImages, currentProduct, currentPlan, showPosts, favoriteCommunityPosts, rideBenefits, purchaseProduct, purchaseImage, purchasePrice, toast, formatStat, animateStats, animateCarbonProgress, setTab, handleWechatLogin, handleLogout, requireLogin, chooseBanner, chooseProduct, onProductChange, openShop, openPurchase, closePurchase, openPlanPurchase, closePlanPurchase, startPlanPayment, submitPurchase, openQuickAction, refreshNearbyVehicles, loadMoreRideHistory, loadMorePointTransactions, openNotifications, closeNotificationPage, handleNotificationBack, openNotification, openLocationPage, selectProvince, selectCity, openProduct, goProduct, toggleRedeem, useRideBenefit, toggleLike, openCommunityPostDetail, closeCommunityPostDetail, toggleCommunityFavorite, submitCommunityComment, openFavoriteCommunityPost, toggleFollow, openScanPage, closeScanPage, openSearchPage, closeSearchPage, openBanner, closeBannerPage, openCommunityPost, closeCommunityPost, chooseCommunityPostPhotos, removeCommunityPostPhoto, submitCommunityPost, claimNewUserCoupon, openSearchResult, completeScan, scan, openPanel, openProfileEdit, closeProfileEdit, chooseProfileAvatar, saveProfileEdit, openSettingsPage, closeSettingsPage, setDefaultAddress, addAddress, closeAddressEditor, saveAddress, openRepairForm, closeRepairPage, openRepairRecordsPage, closeRepairRecordsPage, openRepairRecordDetail, closeRepairRecordDetail, openDetail, closeDetail, chooseRepairPhoto, removeRepairPhoto, toggleRepairType, submitRepair, openRideSettlement, closeRideSettlement, confirmEndRide, askService, openRideHistory, openPointsLedger, openMemberBenefits, detailTitle, panelContent, computed, onBeforeUnmount, onMounted, ref, assets, badges, banners, mallItems, nearbySpots, plans, products, quickActions, getStoredToken, getStoredUser, loginWithWechat, clearLogin, useToast })
</script>

<template>
  <view v-if="sessionExpired" class="session-expired-page">
    <wd-icon name="warning" size="34" />
    <b>登录已过期</b>
    <text>为了保障账户安全，请重新登录后继续使用。</text>
    <wd-button @click="handleWechatLogin">重新登录</wd-button>
  </view>
  <view class="tuneng-app" :style="{ backgroundImage: `url(${assets.bg})` }">
    <wd-toast /><view class="wash" />
    <view v-if="repairPage" class="repair-page">
      <view class="repair-page-nav"><wd-button @click="closeRepairPage"><wd-icon name="arrow-left" size="20" /></wd-button><b>在线报修</b><text @click="openRepairRecordsPage">报修记录</text></view>
      <scroll-view class="repair-page-scroll" scroll-y :show-scrollbar="false"><view class="repair-detail">
        <view class="repair-vehicle-card"><view class="repair-card-head"><text>报修车辆</text></view><view class="repair-vehicle"><image src="/static/products/vehicles/t87d-moon-white-card.png" mode="aspectFit" /><view><b>途能 T87D</b><text>车辆 ID</text><input v-model="repairVehicleId" maxlength="20" placeholder="请输入车辆 ID" /></view></view></view>
        <view class="repair-card"><b>故障类型</b><view class="repair-types"><text v-for="item in ['无法启动', '充电异常', '电池问题', '刹车异常', '轮胎问题', '灯光问题', '车辆异响', '其他问题']" :key="item" :class="{ active: selectedRepairTypes.includes(item) }" @click="toggleRepairType(item)">{{ item }}</text></view></view>
        <view class="repair-card repair-description"><b>问题描述</b><textarea v-model="repairDescription" maxlength="200" placeholder="请描述车辆出现的问题，例如：无法启动、骑行过程中出现异响等" /><text>{{ repairDescription.length }} / 200</text></view>
        <view class="repair-card repair-upload"><b>上传照片</b><small>上传车辆故障照片，有助于快速判断问题</small><view class="repair-photo-list"><view v-for="(photo, index) in repairPhotos" :key="photo" class="repair-photo"><image :src="photo" mode="aspectFill" /><text @click="removeRepairPhoto(index)">×</text></view><view v-if="repairPhotos.length < 3" class="repair-photo-add" @click="chooseRepairPhoto"><wd-icon name="plus" :size="22" /><text>添加照片</text></view></view></view>
        <view class="repair-card repair-contact"><view><b>联系方式</b><input v-model="repairContact" type="number" maxlength="11" placeholder="请输入手机号" /></view><text>可编辑</text></view>
        <wd-button class="repair-submit" @click="submitRepair">提交报修申请</wd-button>
      </view></scroll-view>
    </view>
    <view v-else-if="repairRecordsPage" class="repair-records-page"><view class="repair-page-nav"><wd-button @click="closeRepairRecordsPage"><wd-icon name="arrow-left" size="20" /></wd-button><b>报修记录</b><text /></view><scroll-view class="repair-records-scroll" scroll-y :show-scrollbar="false"><view class="repair-record-card" v-for="item in repairRecords" :key="item.id"><view class="repair-record-head"><view><b>{{ item.type }}</b><text>{{ item.date }} · {{ item.vehicle }}</text></view><em :class="{ done: item.status === '已完成' }">{{ item.status }}</em></view><text class="repair-record-detail">{{ item.detail }}</text><view class="repair-record-link" @click="openRepairRecordDetail(item)">查看详情 <wd-icon name="arrow-right" size="15" /></view></view><view class="repair-record-empty" v-if="false">暂无报修记录</view></scroll-view></view>
    <view v-else-if="locationPage" class="location-page"><view class="simple-page-nav"><wd-button @click="locationPage = false"><wd-icon name="arrow-left" size="20" /></wd-button><b>选择定位</b><text /></view><view class="location-current"><image src="/static/icons/map-pin.png" mode="aspectFit" /><view><small>当前定位</small><b>{{ currentLocation.province }} · {{ currentLocation.city }}</b></view></view><scroll-view class="location-page-scroll" scroll-y :show-scrollbar="false"><view class="location-columns"><view class="location-provinces"><b>省 / 直辖市</b><text v-for="item in locationData" :key="item.province" :class="{ active: selectedProvince === item.province }" @click="selectProvince(item.province)">{{ item.province }}</text></view><view class="location-cities"><b>{{ selectedProvince }}</b><text v-for="city in selectedCities" :key="city" :class="{ active: selectedCity === city }" @click="selectCity(city)">{{ city }}</text></view></view></scroll-view></view>
    <view v-else-if="notificationPage" class="notification-page"><view class="simple-page-nav"><wd-button @click="handleNotificationBack"><wd-icon name="arrow-left" size="20" /></wd-button><b>{{ selectedNotification ? '通知详情' : '消息通知' }}</b><text /></view><scroll-view class="notification-page-scroll" scroll-y :show-scrollbar="false"><view v-if="selectedNotification" class="notification-detail"><view class="notification-detail-head"><view class="notification-badge" :class="selectedNotification.type"><wd-icon :name="selectedNotification.type === 'service' ? 'chat' : selectedNotification.type === 'activity' ? 'gift' : 'bell'" size="22" /></view><view><b>{{ selectedNotification.title }}</b><text>{{ selectedNotification.time }}</text></view></view><view class="notification-detail-copy">{{ selectedNotification.detail }}</view><view v-if="selectedNotification.type === 'service'" class="notification-chat"><view class="chat-welcome">你好，我是途能智能客服</view><view class="chat-bubble">我可以协助处理租赁、补能、报修、积分和订单问题。</view><view v-for="(message,index) in chatMessages" :key="index" :class="message.role === 'user' ? 'chat-user' : 'chat-bubble'">{{ message.text }}</view><view class="chat-options"><text @click="askService('租车规则')">租车规则</text><text @click="askService('车辆故障')">车辆故障</text><text @click="askService('积分兑换')">积分兑换</text></view></view></view><view v-else class="notification-list"><view v-for="item in notifications" :key="item.id" class="notification-item" @click="openNotification(item)"><view class="notification-badge" :class="item.type"><wd-icon :name="item.type === 'service' ? 'chat' : item.type === 'activity' ? 'gift' : 'bell'" size="22" /></view><i v-if="item.unread" class="notification-unread-dot" /><view><view class="notification-item-head"><b>{{ item.title }}</b><text>{{ item.time }}</text></view><small>{{ item.summary }}</small></view><wd-icon name="arrow-right" size="18" /></view></view></scroll-view></view>
    <view v-else-if="scanPage" class="scan-page"><view class="simple-page-nav"><wd-button @click="closeScanPage"><wd-icon name="arrow-left" size="20" /></wd-button><b>扫码开锁</b><text /></view><view class="scan-page-content"><view class="scan-viewfinder"><view class="scan-frame"><i class="scan-corner top-left" /><i class="scan-corner top-right" /><i class="scan-corner bottom-left" /><i class="scan-corner bottom-right" /><view class="scan-line" /></view><view class="scan-viewfinder-copy"><b>对准车辆二维码</b><text>请将二维码放入扫描框内</text></view></view><view class="scan-manual"><view><b>电脑调试</b><text>输入车辆 ID 模拟扫码结果</text></view><input v-model="scanVehicleId" maxlength="20" placeholder="例如：TN-20240725" /><wd-button @click="completeScan(scanVehicleId)">确认开锁</wd-button></view></view></view>
    <view v-else-if="profileEditPage" class="profile-edit-page"><view class="simple-page-nav"><wd-button @click="closeProfileEdit"><wd-icon name="arrow-left" size="20" /></wd-button><b>编辑个人资料</b><text /></view><scroll-view class="profile-edit-scroll" scroll-y :show-scrollbar="false"><view class="profile-avatar-editor" @click="chooseProfileAvatar"><image v-if="profileDraft.avatar" :src="profileDraft.avatar" mode="aspectFill" /><text v-else>{{ profileDraft.nickname.slice(0, 1) }}</text><i><wd-icon name="edit" size="16" /></i></view><text class="profile-avatar-tip">点击更换头像</text><view class="profile-edit-form"><view><text>昵称</text><input v-model="profileDraft.nickname" maxlength="16" placeholder="请输入昵称" /></view><view><text>途能 ID</text><b>{{ user?.user_id || user?.userId || 'TN-20240725' }}</b></view><view><text>会员等级</text><b>{{ user?.member_level || '绿色会员' }}</b></view></view><wd-button class="profile-save-button" @click="saveProfileEdit">保存修改</wd-button></scroll-view></view><view v-else-if="settingsPage === 'address'" class="settings-detail-page"><view class="simple-page-nav"><wd-button @click="closeSettingsPage"><wd-icon name="arrow-left" size="20" /></wd-button><b>地址管理</b><text /></view><scroll-view class="settings-detail-scroll" scroll-y :show-scrollbar="false"><view class="settings-page-tip">常用地址可用于购车和配件配送</view><view v-for="item in addressEntries" :key="item.id" class="address-entry" :class="{ active: item.active }" @click="setDefaultAddress(item.id)"><view class="address-tag">{{ item.label }}</view><view><b>{{ item.title }}</b><text>{{ item.detail }}</text><small v-if="item.active">默认地址</small></view><wd-icon name="arrow-right" size="18" /></view><wd-button class="settings-primary-action" @click="addAddress"><wd-icon name="plus" size="18" /> 新增地址</wd-button></scroll-view></view><view v-else-if="settingsPage === 'privacy'" class="settings-detail-page"><view class="simple-page-nav"><wd-button @click="closeSettingsPage"><wd-icon name="arrow-left" size="20" /></wd-button><b>隐私设置</b><text /></view><scroll-view class="settings-detail-scroll" scroll-y :show-scrollbar="false"><view class="settings-page-tip">你可以随时调整数据授权范围</view><view class="privacy-group"><view><view><b>位置服务</b><text>用于展示附近车辆和停车点</text></view><switch v-model="privacySettings.location" color="#1a7a4a" /></view><view><view><b>骑行记录</b><text>用于生成行程和碳减排数据</text></view><switch v-model="privacySettings.rides" color="#1a7a4a" /></view><view><view><b>个性化推荐</b><text>根据使用习惯推荐活动和服务</text></view><switch v-model="privacySettings.recommendation" color="#1a7a4a" /></view></view><view class="privacy-note">关闭后不影响已保存的历史订单和碳积分。</view></scroll-view></view><view v-else-if="settingsPage === 'about'" class="settings-detail-page"><view class="simple-page-nav"><wd-button @click="closeSettingsPage"><wd-icon name="arrow-left" size="20" /></wd-button><b>关于途能</b><text /></view><scroll-view class="settings-detail-scroll" scroll-y :show-scrollbar="false"><view class="about-hero"><view>途</view><b>途能绿色出行</b><text>太阳能智能出行服务平台</text><small>版本 v2.4.1</small></view><view class="about-list"><view @click="toast('当前已是最新版本')"><b>检查更新</b><text>v2.4.1 已是最新版本</text><wd-icon name="arrow-right" size="18" /></view><view @click="toast('服务协议')"><b>用户服务协议</b><text>查看平台服务条款</text><wd-icon name="arrow-right" size="18" /></view><view @click="toast('隐私政策')"><b>隐私政策</b><text>查看数据使用说明</text><wd-icon name="arrow-right" size="18" /></view></view><text class="about-copy">途能绿色出行 · 让每一次出发更低碳</text></scroll-view></view><view v-else-if="communityPostDetailPage && selectedCommunityPost" class="community-detail-page"><view class="simple-page-nav"><wd-button @click="closeCommunityPostDetail"><wd-icon name="arrow-left" size="20" /></wd-button><b>帖子详情</b><wd-button class="community-detail-favorite" @click="toggleCommunityFavorite(selectedCommunityPost)"><text v-if="communityFavoritePostIds.includes(selectedCommunityPost.id)">已收藏</text><text v-else>收藏</text></wd-button></view><scroll-view class="community-detail-scroll" scroll-y :show-scrollbar="false"><view class="community-detail-card"><view class="community-detail-user"><i :style="{ background: selectedCommunityPost.color }">{{ selectedCommunityPost.avatar }}</i><view><b>{{ selectedCommunityPost.user }}</b><text>{{ selectedCommunityPost.time }}</text></view><wd-button @click="toggleFollow(selectedCommunityPost.id)">{{ followedPosts.includes(selectedCommunityPost.id) ? '已关注' : '关注' }}</wd-button></view><view class="community-detail-content">{{ selectedCommunityPost.content }}</view><image class="community-detail-media" :src="selectedCommunityPost.image" mode="aspectFill" /><view class="community-detail-tags"><text v-for="tag in selectedCommunityPost.tags" :key="tag">{{ tag }}</text></view><view class="community-detail-actions"><text v-if="likedPosts.includes(selectedCommunityPost.id)" class="active" @click="toggleLike(selectedCommunityPost)">♥ {{ selectedCommunityPost.likes }}</text><text v-else @click="toggleLike(selectedCommunityPost)">♡ {{ selectedCommunityPost.likes }}</text><text>◌ {{ selectedCommunityPost.comments }} 评论</text><text v-if="communityFavoritePostIds.includes(selectedCommunityPost.id)" class="active" @click="toggleCommunityFavorite(selectedCommunityPost)">★ 已收藏</text><text v-else @click="toggleCommunityFavorite(selectedCommunityPost)">☆ 收藏</text></view></view><view class="community-comment-heading"><b>全部评论</b><text>{{ selectedCommunityPost.comments }} 条</text></view><view v-for="comment in (communityComments[selectedCommunityPost.id] || [])" :key="comment.id" class="community-comment"><i>{{ comment.avatar }}</i><view><b>{{ comment.user }}</b><text>{{ comment.time }}</text><text class="community-comment-copy">{{ comment.content }}</text></view></view><view v-if="!(communityComments[selectedCommunityPost.id] || []).length" class="community-comment-empty">还没有评论，来说两句吧</view></scroll-view><view class="community-comment-compose"><input v-model="communityCommentContent" maxlength="120" confirm-type="send" placeholder="写下你的评论..." @confirm="submitCommunityComment" /><wd-button @click="submitCommunityComment">发送</wd-button></view></view><view v-else-if="communityPostPage" class="community-post-page"><view class="simple-page-nav"><wd-button @click="closeCommunityPost"><wd-icon name="arrow-left" size="20" /></wd-button><b>发布骑行帖子</b><text /></view><scroll-view class="community-post-scroll" scroll-y :show-scrollbar="false"><view class="community-post-topic">#绿色骑行季#</view><textarea v-model="communityPostContent" maxlength="300" placeholder="分享你的绿色出行瞬间吧..." /><view class="community-post-count">{{ communityPostContent.length }} / 300</view><view class="community-photo-grid"><view v-for="(photo, index) in communityPostPhotos" :key="photo" class="community-post-photo"><image :src="photo" mode="aspectFill" /><text @click="removeCommunityPostPhoto(index)">×</text></view><view v-if="communityPostPhotos.length < 6" class="community-photo-add" @click="chooseCommunityPostPhotos"><wd-icon name="camera" size="24" /><text>添加图片</text></view></view><view class="community-post-tip">发布后将自动参与绿色骑行季活动</view><wd-button class="community-post-submit" @click="submitCommunityPost">发布帖子</wd-button></scroll-view></view>
    <view v-else-if="bannerPage === 'season'" class="banner-detail-page season-detail-page"><view class="simple-page-nav"><wd-button @click="closeBannerPage"><wd-icon name="arrow-left" size="20" /></wd-button><b>绿色骑行季</b><text /></view><scroll-view class="banner-detail-scroll" scroll-y :show-scrollbar="false"><view class="season-poster"><image src="/static/banners/green-riding-season-poster.png" mode="aspectFit" /></view></scroll-view><wd-button class="season-join-action" @click="openCommunityPost">立即参与</wd-button></view>
    <view v-else-if="bannerPage === 'newUser'" class="banner-detail-page new-user-page"><view class="simple-page-nav"><wd-button @click="closeBannerPage"><wd-icon name="arrow-left" size="20" /></wd-button><b>首骑免费</b><text /></view><scroll-view class="banner-detail-scroll" scroll-y :show-scrollbar="false"><view class="new-user-content"><view class="new-user-coupon" :class="{ claimed: newUserCouponClaimed }"><view class="coupon-main"><text>新用户专享</text><b>首骑立减 ¥6</b><strong>首次骑行可用</strong></view><view class="coupon-side"><b>{{ newUserCouponClaimed ? '已领取' : '免费券' }}</b><text>首骑专属</text></view></view><view class="coupon-status" v-if="newUserCouponClaimed">已领取，可在“我的权益”中查看</view><view class="coupon-section"><b>使用方式</b><view class="coupon-steps"><view v-for="item in [{ step: '1', title: '领取优惠券', desc: '点击下方立即领取' }, { step: '2', title: '扫码开锁', desc: '扫描车辆二维码开始骑行' }, { step: '3', title: '自动抵扣', desc: '订单结算时自动立减' }]" :key="item.step"><em>{{ item.step }}</em><view><b>{{ item.title }}</b><text>{{ item.desc }}</text></view></view></view></view><view class="coupon-section coupon-rules"><b>使用规则</b><text>有效期：领取后 7 天内有效</text><text>适用城市：无锡市共享租赁车辆</text><text>不可与其他骑行优惠券叠加使用</text><text>仅限注册后首次完成骑行时使用</text></view><wd-button class="coupon-action" @click="claimNewUserCoupon">{{ newUserCouponClaimed ? '去扫码开锁' : '立即领取' }}</wd-button></view></scroll-view></view>
    <view v-else-if="searchPage" class="search-page">
      <view class="search-page-nav"><wd-button @click="closeSearchPage"><wd-icon name="arrow-left" size="20" /></wd-button><view class="search-page-input"><image class="figma-icon search-icon" src="/static/icons/search.png" mode="aspectFit" /><input v-model="searchText" focus placeholder="搜索车辆、商品或服务" confirm-type="search" /></view><text @click="closeSearchPage">取消</text></view>
      <scroll-view class="search-page-scroll" scroll-y :show-scrollbar="false"><view v-if="!searchText.trim()" class="search-default"><view class="search-section-title"><b>快捷服务</b><text>常用功能一键直达</text></view><view class="search-shortcuts"><view v-for="item in searchShortcuts" :key="item.id" @click="openSearchResult(item)"><image :class="{ 'search-repair-icon': item.id === 'repair' }" :src="item.icon" mode="aspectFit" /><text>{{ item.title }}</text></view></view><view class="search-section-title search-tips-title"><b>可以搜索</b></view><view class="search-tips"><text>车辆 ID</text><text>附近车辆</text><text>在线报修</text><text>碳积分</text><text>头盔车锁</text><text>收费规则</text></view></view><view v-else class="search-results"><view class="search-result-head"><b>功能结果</b><text>找到 {{ searchResults.length }} 项</text></view><view v-for="item in searchResults" :key="item.id" class="search-result-item" @click="openSearchResult(item)"><image :src="item.icon" mode="aspectFit" /><view><b>{{ item.title }}</b><text>{{ item.desc }}</text></view><wd-icon name="arrow-right" size="18" /></view><view v-if="!searchResults.length" class="search-empty"><image src="/static/icons/search.png" mode="aspectFit" /><b>没有找到对应服务</b><text>试试“车辆、积分、报修、客服”等关键词</text></view></view></scroll-view>
    </view>
    <view v-else-if="purchasePage" class="purchase-page"><view class="simple-page-nav"><wd-button @click="closePurchase"><wd-icon name="arrow-left" size="20" /></wd-button><b>确认购买</b><text /></view><scroll-view class="purchase-scroll" scroll-y :show-scrollbar="false"><view class="purchase-product"><image :src="purchaseImage" mode="aspectFill" /><view><small>{{ purchaseType === 'vehicle' ? '太阳能智能助力车' : '途能精选配件' }}</small><b>{{ purchaseType === 'vehicle' ? `途能 T87D · ${purchaseColor}` : purchaseItem.name }}</b><text v-if="purchaseType === 'vehicle'">{{ purchaseProduct.edition }}</text><strong>{{ purchasePrice }}</strong></view></view><view v-if="purchaseType === 'vehicle'" class="purchase-section"><b>选择颜色</b><view class="purchase-colors"><text v-for="item in products" :key="item.name" :class="{ active: purchaseColor === item.name }" @click="purchaseColor = item.name">{{ item.name }}</text></view></view><view class="purchase-section"><b>收货信息</b><view class="purchase-form"><label><text>收货人</text><input v-model="purchaseForm.name" maxlength="20" placeholder="请输入收货人姓名" /></label><label><text>手机号</text><input v-model="purchaseForm.phone" type="number" maxlength="11" placeholder="请输入手机号" /></label><label><text>所在地区</text><input v-model="purchaseForm.region" maxlength="30" placeholder="省 / 市 / 区" /></label><label><text>详细地址</text><textarea v-model="purchaseForm.address" maxlength="80" placeholder="街道、门牌号、楼栋号等" /></label></view></view><view class="purchase-section purchase-delivery"><b>配送方式</b><text>绿色专送 · 预计 3 - 5 个工作日送达</text></view><wd-button class="purchase-submit" @click="submitPurchase">提交订单 · {{ purchasePrice }}</wd-button></scroll-view></view>
    <view v-else-if="planPurchasePage" class="plan-purchase-page"><view class="simple-page-nav"><wd-button @click="closePlanPurchase"><wd-icon name="arrow-left" size="20" /></wd-button><b>购买套餐</b><text /></view><scroll-view class="plan-purchase-scroll" scroll-y :show-scrollbar="false"><view class="plan-purchase-hero"><text>绿色骑行套餐</text><b>{{ currentPlan.name }}</b><strong>{{ currentPlan.price }} <small>{{ currentPlan.unit }}</small></strong><em>{{ currentPlan.validity }}</em></view><view class="plan-purchase-section"><b>套餐权益</b><view v-for="benefit in currentPlan.benefits" :key="benefit"><wd-icon name="check-circle" size="18" /><text>{{ benefit }}</text></view></view><view class="plan-purchase-section payment-method"><b>支付方式</b><view><wd-icon name="weixin" size="24" /><view><strong>微信支付</strong><text>安全快捷，支付后套餐即时到账</text></view><wd-icon name="check-circle" size="20" /></view></view><view class="plan-purchase-tip">确认购买后将跳转至微信支付</view><wd-button class="plan-payment-button" @click="startPlanPayment">确认购买 {{ currentPlan.price }}</wd-button></scroll-view></view>
    <scroll-view v-else class="content" scroll-y :show-scrollbar="false">
      <HomePage v-if="activeTab === 'home'" />

      <RentalPage v-else-if="activeTab === 'rental'" />

      <CarbonPage v-else-if="activeTab === 'carbon'" />

      <ShopPage v-else-if="activeTab === 'shop'" />

      <CommunityPage v-else-if="activeTab === 'community'" />

      <ProfilePage v-else />
    </scroll-view>

    <wd-button v-if="activeTab === 'rental'" class="scan-button" @click="scan"><view class="scan-button-content"><image class="figma-icon scan-icon" src="/static/icons/qr-code-white.png" mode="aspectFit" /><text>扫码开锁</text></view></wd-button>
    <view class="bottom-nav"><view v-for="item in [{ id: 'home', label: '首页' }, { id: 'rental', label: '租车' }, { id: 'carbon', label: '碳资产' }, { id: 'community', label: '社区' }, { id: 'profile', label: '我的' }]" :key="item.id" :class="[{ active: activeTab === item.id, carbon: item.id === 'carbon' }, `nav-${item.id}`]" @click="setTab(item.id)"><b><image v-if="item.id === 'profile'" class="figma-icon nav-icon nav-profile-icon" src="/static/icons/nav-profile.png" mode="aspectFit" /><image v-else-if="item.id === 'community'" class="figma-icon nav-icon nav-community-icon" src="/static/icons/nav-community.png" mode="aspectFit" /><image v-else-if="item.id === 'carbon'" class="figma-icon nav-carbon-icon" src="/static/icons/nav-carbon.png" mode="aspectFit" /><image v-else-if="item.id === 'rental'" class="figma-icon nav-icon nav-rental-icon" src="/static/icons/nav-rental.png" mode="aspectFit" /><image v-else class="figma-icon nav-icon nav-home-icon" src="/static/icons/nav-home.png" mode="aspectFit" /></b><text>{{ item.label }}</text></view></view>
    <view v-if="profilePanel && !repairPage && !repairRecordsPage && !locationPage && !notificationPage" class="profile-detail-page"><view class="detail-panel secondary-shell" @click.stop><view class="detail-nav"><wd-button @click="profilePanel = ''"><wd-icon name="arrow-left" :size="20" /></wd-button><b>{{ panelContent.title }}</b><view /></view>
      <view v-if="profilePanel === 'orders'"><view class="order-tabs"><text v-for="item in [{id:'all',label:'全部'},{id:'purchase',label:'购买订单'},{id:'ride',label:'骑行订单'}]" :key="item.id" :class="{active:orderFilter===item.id}" @click="orderFilter=item.id">{{item.label}}</text></view><view class="order-card" v-if="orderFilter !== 'ride'" @click="openDetail('purchaseOrder')"><image src="/static/products/vehicles/t87d-moon-white-card.png" mode="aspectFill"/><view><em>待收货</em><b>途能 T87D 太阳能助力车</b><text>皓月白 · 标准版 · 订单 TN202608120001</text><strong>实付 ¥4,999.00</strong></view></view><view class="order-card accessory-order-card" v-if="orderFilter !== 'ride'" @click="openDetail('accessoryOrder')"><image src="/static/products/accessories/helmet.png" mode="aspectFit"/><view><em>待发货</em><b>轻量骑行头盔</b><text>一体成型 · 通风透气 · 订单 TA202608120006</text><strong>实付 ¥299.00</strong></view></view><view v-for="order in purchasedOrders" :key="order.id" class="order-card accessory-order-card" v-if="orderFilter !== 'ride'" @click="openDetail('dynamicPurchaseOrder', order)"><image :src="order.image" mode="aspectFit"/><view><em>待发货</em><b>{{ order.title }}</b><text>{{ order.subtitle }} · 订单 {{ order.id }}</text><strong>实付 {{ order.price }}</strong></view></view><view class="order-card" v-if="orderFilter !== 'purchase'" @click="openDetail('rideOrder')"><view class="order-bike"><image src="/static/profile/ride-order-route.png" mode="aspectFit" /></view><view><em class="done">已完成</em><b>南禅寺 → 崇安寺</b><text>2026/08/12 08:32 · 骑行 36 分钟</text><strong>¥6.00 · 12.4 km</strong></view></view></view>
      <view v-else-if="profilePanel === 'wallet'"><view class="points-hero"><wd-icon name="money-circle" :size="28" /><text>可用碳积分</text><b>8,620</b><small>本月已获得 +1,286 pts</small></view><view class="action-grid"><view @click="openDetail('points')"><wd-icon name="note" :size="21" /><text>积分明细</text></view><view @click="openDetail('benefits')"><wd-icon name="gift" :size="21" /><text>我的权益</text></view><view @click="openDetail('carbonWallet')"><wd-icon name="wallet" :size="21" /><text>碳资产钱包</text></view></view><view class="section-title">最近积分变动</view><view class="ledger-row" v-for="item in [['骑行奖励','今天 08:32','+52'],['绿色出行周挑战','昨天 18:06','+120'],['兑换骑行优惠券','07月25日','-120']]" :key="item[0]"><view><b>{{item[0]}}</b><text>{{item[1]}}</text></view><em :class="{minus:item[2].startsWith('-')}">{{item[2]}} pts</em></view></view>
      <view v-else-if="profilePanel === 'vehicle'"><view class="vehicle-hero"><image src="/static/products/vehicles/t87d-moon-white-card.png" mode="aspectFit"/><view><b>途能 T87D</b><text>皓月白 · 标准版</text><em><wd-icon name="check-circle" :size="14" /> 车辆健康良好</em></view></view><view class="metric-grid"><view><b>86%</b><text>当前电量</text></view><view><b>1.8</b><text>今日补能 kWh</text></view><view><b>247</b><text>累计里程 km</text></view></view><wd-button class="detail-action" @click="openDetail('vehicleDetail')">查看车辆详情</wd-button></view>
      <view v-else-if="profilePanel === 'favorites'"><view v-if="favoriteCommunityPosts.length" class="favorite-post-section"><text class="favorite-section-label">收藏的帖子</text><view v-for="post in favoriteCommunityPosts" :key="post.id" class="favorite-post-card" @click="openFavoriteCommunityPost(post)"><image :src="post.image" mode="aspectFill" /><view><b>{{ post.content }}</b><text>{{ post.user }} · {{ post.time }}</text><small>♥ {{ post.likes }} · ◌ {{ post.comments }}</small></view><wd-icon name="arrow-right" size="18" /></view></view><view v-if="!favoriteCommunityPosts.length" class="empty-state"><wd-icon name="heart" :size="35" /><text>暂无收藏帖子</text></view></view>
      <view v-else-if="profilePanel === 'repair'"><view class="service-banner"><wd-icon name="tools" :size="28" /><view><b>车辆需要帮助？</b><text>在线提交故障，服务站会尽快联系你</text></view></view><view class="service-row" @click="openDetail('repairForm')"><view><b>在线报修</b><text>填写故障情况并提交申请</text></view><wd-icon name="arrow-right" :size="20" /></view><view class="service-row" @click="openDetail('repairRecords')"><view><b>维修记录</b><text>查看保养、维修和服务进度</text></view><wd-icon name="arrow-right" :size="20" /></view></view>
      <view v-else-if="profilePanel === 'service'"><view class="chat"><view class="chat-welcome">你好，我是途能智能客服</view><view class="chat-bubble">我可以协助处理租赁、补能、报修、积分和订单问题。</view><view v-for="(message,index) in chatMessages" :key="index" :class="message.role === 'user' ? 'chat-user' : 'chat-bubble'">{{message.text}}</view><view class="chat-options"><text @click="askService('租车规则')">租车规则</text><text @click="askService('车辆故障')">车辆故障</text><text @click="askService('积分兑换')">积分兑换</text></view></view></view>
      <view v-else-if="profilePanel === 'rides'"><view class="ride-summary"><view><b>247.3</b><text>累计骑行 km</text></view><view><b>12.68</b><text>累计减碳 kg</text></view><view><b>38</b><text>骑行次数</text></view></view><view class="ride-list" v-for="ride in rideHistory" :key="ride.id" @click="openDetail('rideDetail',ride)"><view class="ride-icon"><wd-icon name="location" :size="20" /></view><view><b>{{ride.route}}</b><text>{{ride.date}} · {{ride.time}}</text></view><em>{{ride.km}}<small>{{ride.fee}}</small></em></view></view>
    </view></view>
    <view v-if="detailPage && !repairPage && !repairRecordsPage && !locationPage && !notificationPage" :class="['modal', 'page-detail', { 'repair-page-detail': detailPage === 'repairForm' }]" @click="closeDetail"><scroll-view scroll-y class="full-detail" @click.stop><view class="full-nav"><wd-button @click="closeDetail"><wd-icon name="arrow-left" size="20" /></wd-button><b>{{detailTitle}}</b><view /></view>
      <view v-if="detailPage === 'points'"><view class="points-detail-head"><b>8,620</b><text>当前可用积分</text><view class="point-tabs"><text :class="{active:pointFilter==='all'}" @click="pointFilter='all'">全部</text><text :class="{active:pointFilter==='income'}" @click="pointFilter='income'">收入</text><text :class="{active:pointFilter==='spend'}" @click="pointFilter='spend'">支出</text></view></view><view class="ledger-row" v-for="item in [['骑行碳积分奖励','2026/08/12 09:08','+52'],['连续骑行挑战奖励','2026/08/11 18:06','+120'],['骑行优惠券兑换','2026/07/25 11:30','-120'],['绿色出行周奖励','2026/07/23 10:14','+300']]" :key="item[0]" v-show="pointFilter==='all'||(pointFilter==='income'?item[2].startsWith('+'):item[2].startsWith('-'))"><view><b>{{item[0]}}</b><text>{{item[1]}}</text></view><em :class="{minus:item[2].startsWith('-')}">{{item[2]}} pts</em></view></view>
      <view v-else-if="detailPage === 'benefits'" class="benefits-detail"><view class="benefits-summary"><wd-icon name="gift" :size="28" /><view><b>我的权益</b><text>{{ rideBenefits.length }} 项骑行权益可用</text></view></view><view v-if="rideBenefits.length" class="benefits-list"><view v-for="item in rideBenefits" :key="item.id" class="benefit-row"><wd-icon :name="item.id === 1 ? 'ticket' : 'calendar'" :size="23" /><view><b>{{ item.name }}</b><text>{{ item.desc }}</text></view><wd-button @click="useRideBenefit(item)">去使用</wd-button></view></view><view v-else class="benefits-empty"><wd-icon name="gift" :size="34" /><b>暂无可用权益</b><text>可前往碳积分商城兑换骑行优惠券和月卡</text><wd-button @click="openShop('points'); closeDetail()">去兑换</wd-button></view></view><view v-else-if="detailPage === 'level'"><view class="level-hero"><wd-icon name="star-on" :size="30" /><b>黄金骑士</b><text>再获得 1,380 pts 升至钻石骑士</text><view><i/><i/><i/><i class="off"/></view></view><view class="section-title">当前等级权益</view><view class="benefit-row" v-for="item in [['租车折扣','租赁订单享 9.2 折'],['优先客服','专属服务通道'],['生日礼遇','生日月双倍碳积分'],['活动资格','优先报名绿色骑行活动']]" :key="item[0]"><wd-icon name="gift" :size="20" /><view><b>{{item[0]}}</b><text>{{item[1]}}</text></view></view></view>
      <view v-else-if="detailPage === 'carbonWallet'"><view class="carbon-wallet-hero"><wd-icon name="chart-pie" :size="29" /><text>累计减碳</text><b>12.68 <small>kg</small></b><view><text>等效植树 12 棵</text><text>绿色里程 247 km</text></view></view><view class="wallet-stats"><view><b>8,620</b><text>碳积分</text></view><view><b>38</b><text>低碳出行</text></view></view><view class="section-title">碳资产凭证</view><view class="certificate"><wd-icon name="secured" :size="26" /><view><b>2026 年度绿色出行凭证</b><text>已记录 12.68 kg 碳减排量</text></view><wd-icon name="check-circle" :size="20" /></view></view>
      <view v-else-if="detailPage === 'vehicleDetail'"><image src="/static/products/vehicles/t87d-moon-white-card.png" class="detail-bike" mode="aspectFit"/><view class="info-block"><b>车辆基础信息</b><view v-for="item in [['车架编号','TN87D20260812001'],['购买日期','2026/06/18'],['质保到期','2028/06/17'],['最近保养','2026/07/12']]" :key="item[0]"><text>{{item[0]}}</text><em>{{item[1]}}</em></view></view><view class="info-block"><b>太阳能补能数据</b><view><text>今日补能</text><em>1.8 kWh</em></view><view><text>累计发电</text><em>42.6 kWh</em></view></view></view>

      <view v-else-if="detailPage === 'repairForm'" class="repair-detail">
        <view class="repair-vehicle-card"><view class="repair-card-head"><text>报修车辆</text></view><view class="repair-vehicle"><image src="/static/products/vehicles/t87d-moon-white-card.png" mode="aspectFit" /><view><b>途能 T87D</b><text>车辆 ID</text><input v-model="repairVehicleId" maxlength="20" placeholder="请输入车辆 ID" /></view></view></view>
        <view class="repair-card"><b>故障类型</b><view class="repair-types"><text v-for="item in ['无法启动', '充电异常', '电池问题', '刹车异常', '轮胎问题', '灯光问题', '车辆异响', '其他问题']" :key="item" :class="{ active: repairType === item }" @click="repairType = item">{{ item }}</text></view></view>
        <view class="repair-card repair-description"><b>问题描述</b><textarea v-model="repairDescription" maxlength="200" placeholder="请描述车辆出现的问题，例如：无法启动、骑行过程中出现异响等" /><text>{{ repairDescription.length }} / 200</text></view>
        <view class="repair-card repair-upload"><b>上传照片</b><small>上传车辆故障照片，有助于快速判断问题</small><view class="repair-photo-list"><view v-for="(photo, index) in repairPhotos" :key="photo" class="repair-photo"><image :src="photo" mode="aspectFill" /><text @click="removeRepairPhoto(index)">×</text></view><view v-if="repairPhotos.length < 3" class="repair-photo-add" @click="chooseRepairPhoto"><wd-icon name="plus" :size="22" /><text>添加照片</text></view></view></view>
        <view class="repair-card repair-contact"><view><b>联系方式</b><text>138****8888</text></view><text @click="toast('联系方式修改功能即将开放')">修改</text></view>
        <wd-button class="repair-submit" @click="submitRepair">提交报修申请</wd-button>
      </view>
      <view v-else-if="detailPage === 'repairRecords'"><view class="repair-record" v-for="item in [['2026/07/12','常规保养','已完成','更换刹车皮，完成制动系统检查'],['2026/06/20','太阳能面板检测','已完成','面板发电效率正常'],['2026/05/03','首次交付检查','已完成','车辆交付前安全检查']]" :key="item[0]"><i></i><view><b>{{item[1]}}</b><text>{{item[0]}} · {{item[3]}}</text></view><em>{{item[2]}}</em></view></view>
      <view v-else-if="detailPage === 'rideDetail' && selectedItem"><view class="ride-detail-hero"><wd-icon name="location" :size="33" /><b>{{selectedItem.km}}</b><text>{{selectedItem.route}}</text><small>{{selectedItem.date}} {{selectedItem.time}}</small></view><view class="info-block"><b>本次行程</b><view><text>骑行时长</text><em>36 分钟</em></view><view><text>订单费用</text><em>{{selectedItem.fee}}</em></view><view><text>获得积分</text><em>+52 pts</em></view><view><text>减少碳排放</text><em>318 g</em></view></view></view>
      <view v-else-if="detailPage === 'rideOrder'"><image class="ride-order-route-image" src="/static/profile/ride-order-route.png" mode="aspectFit"/><view class="order-detail-hero"><wd-icon name="location" :size="32" /><b>订单已完成</b><text>南禅寺 → 崇安寺</text></view><view class="info-block"><b>订单信息</b><view v-for="item in [['订单编号','TN202608120004'],['骑行时长','36 分钟'],['骑行里程','12.4 km'],['支付金额','¥6.00'],['支付方式','碳积分抵扣 + 微信支付']]" :key="item[0]"><text>{{item[0]}}</text><em>{{item[1]}}</em></view></view></view>
      <view v-else-if="detailPage === 'dynamicPurchaseOrder' && selectedItem"><view class="order-detail-hero purchase-order-status"><wd-icon name="goods" :size="24" /><b>待发货</b><text>订单 {{ selectedItem.id }}</text></view><image :src="selectedItem.image" class="purchase-image" mode="aspectFit"/><view class="info-block"><b>商品与配送信息</b><view><text>商品</text><em>{{ selectedItem.title }}</em></view><view><text>规格</text><em>{{ selectedItem.subtitle }}</em></view><view><text>收货人</text><em>林小绿 138****2088</em></view><view><text>配送地址</text><em>无锡市梁溪区南长街</em></view><view><text>商品金额</text><em>{{ selectedItem.price }}</em></view></view></view><view v-else-if="detailPage === 'accessoryOrder'"><view class="order-detail-hero purchase-order-status"><wd-icon name="goods" :size="24" /><b>待发货</b><text>订单 TA202608120006</text></view><image src="/static/products/accessories/helmet.png" class="purchase-image" mode="aspectFit"/><view class="info-block"><b>商品与配送信息</b><view><text>商品</text><em>轻量骑行头盔</em></view><view><text>收货人</text><em>林小绿 138****2088</em></view><view><text>配送地址</text><em>无锡市梁溪区南长街</em></view><view><text>商品金额</text><em>¥299.00</em></view></view></view><view v-else-if="detailPage === 'purchaseOrder'"><view class="order-detail-hero purchase-order-status"><wd-icon name="goods" :size="32" /><b>等待收货</b><text>订单 TN202608120001</text></view><image src="/static/products/vehicles/t87d-moon-white-card.png" class="purchase-image" mode="aspectFit"/><view class="info-block"><b>配送信息</b><view><text>收货人</text><em>林小绿 138****2088</em></view><view><text>配送地址</text><em>无锡市梁溪区南长街</em></view><view><text>预计送达</text><em>2026/08/16 前</em></view><view><text>商品金额</text><em>¥4,999.00</em></view></view></view>
    </scroll-view></view>

    <view v-if="addressEditorPage" class="settings-detail-page address-editor-page"><view class="simple-page-nav"><wd-button @click="closeAddressEditor"><wd-icon name="arrow-left" size="20" /></wd-button><b>新增地址</b><text /></view><scroll-view class="settings-detail-scroll" scroll-y :show-scrollbar="false"><view class="settings-page-tip">填写后可用于整车和配件配送</view><view class="address-form"><view class="address-label-select"><text v-for="item in ['家','公司','其他']" :key="item" :class="{ active: addressDraft.label === item }" @click="addressDraft.label = item">{{ item }}</text></view><label><text>收货人</text><input v-model="addressDraft.name" maxlength="20" placeholder="请输入收货人姓名" /></label><label><text>手机号</text><input v-model="addressDraft.phone" type="number" maxlength="11" placeholder="请输入手机号" /></label><label><text>所在地区</text><input v-model="addressDraft.region" maxlength="30" placeholder="省 / 市 / 区" /></label><label class="address-detail-field"><text>详细地址</text><textarea v-model="addressDraft.detail" maxlength="80" placeholder="街道、门牌号、楼栋号等" /></label></view><wd-button class="settings-primary-action" @click="saveAddress">保存地址</wd-button></scroll-view></view>
    <view v-if="repairRecordDetailPage && selectedRepairRecord" class="settings-detail-page repair-record-detail-page"><view class="simple-page-nav"><wd-button @click="closeRepairRecordDetail"><wd-icon name="arrow-left" size="20" /></wd-button><b>报修详情</b><text /></view><scroll-view class="settings-detail-scroll" scroll-y :show-scrollbar="false"><view class="repair-detail-status"><wd-icon name="tools" size="30" /><view><b>{{ selectedRepairRecord.status }}</b><text>{{ selectedRepairRecord.detail }}</text></view></view><view class="repair-progress"><b>处理进度</b><view v-for="(step, index) in selectedRepairRecord.steps" :key="step" :class="{ active: selectedRepairRecord.status === '已完成' || index < 2 }"><i>{{ index + 1 }}</i><view><b>{{ step }}</b><text>{{ index === 0 ? selectedRepairRecord.date : index === 1 ? '服务站处理中' : '预计 30 分钟内联系' }}</text></view></view></view><view class="info-block"><b>报修信息</b><view><text>车辆 ID</text><em>{{ selectedRepairRecord.vehicle }}</em></view><view><text>故障类型</text><em>{{ selectedRepairRecord.type }}</em></view><view><text>联系电话</text><em>{{ selectedRepairRecord.contact }}</em></view></view></scroll-view></view>
    <view v-if="rideSettlementPage" class="settings-detail-page ride-settlement-page"><view class="simple-page-nav"><wd-button @click="closeRideSettlement"><wd-icon name="arrow-left" size="20" /></wd-button><b>结束骑行</b><text /></view><scroll-view class="settings-detail-scroll" scroll-y :show-scrollbar="false"><view class="ride-settlement-hero"><wd-icon name="location" size="34" /><b>南禅寺牌楼 → 崇安寺</b><text>骑行 24 分钟 · 4.2 km</text></view><view class="ride-fee-card"><text>本次骑行费用</text><b>¥2.40</b><small>已使用太阳能补能优惠 ¥0.60</small></view><view class="info-block"><b>订单信息</b><view><text>车辆编号</text><em>TN-20240725</em></view><view><text>结束地点</text><em>崇安寺停车点</em></view><view><text>预计获得积分</text><em>+18 pts</em></view></view><wd-button class="settings-primary-action" @click="confirmEndRide">确认结束骑行</wd-button></scroll-view></view>
  </view>
</template>
