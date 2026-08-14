<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { assets, badges, banners, mallItems, nearbySpots, plans, products, records, quickActions } from '../data/tuneng'
import { getStoredToken, getStoredUser, loginWithWechat, logout as clearLogin } from '../services/auth'
import { useToast } from 'wot-design-uni'

const activeTab = ref('home')
const bannerIndex = ref(0)
const productIndex = ref(0)
const plan = ref('day')
const carbonSubTab = ref('recommended')
const redeemed = ref([])
const likedPosts = ref([])
const followedPosts = ref([])
const profilePanel = ref('')
const detailPage = ref('')
const selectedItem = ref(null)
const orderFilter = ref('all')
const pointFilter = ref('all')
const repairDescription = ref('')
const repairType = ref('车辆无法开锁')
const favoriteItems = ref([
  { id: 1, name: 'T87D 极光粉', type: '太阳能电动车', price: '¥4,999', image: '/static/bikes/__Main_0000.png' },
  { id: 2, name: '环保骑行头盔', type: '轻量透气设计', price: '¥299', image: '/static/bikes/_______17853702216266_1_.png' },
])
const chatMessages = ref([])
const searchText = ref('')
const previewUser = { user_id: 'TN-20240725', nickname: '林小绿', avatar: '', member_level: '黄金骑士', points: 8620, total_km: 247, trees: 12 }
const isLoggedIn = ref(true)
const user = ref(getStoredUser() || previewUser)
const loginLoading = ref(false)
const shopTab = ref('vehicles')
const { show: showWotToast } = useToast()
const shopAccessories = [
  { id: 1, name: '轻量骑行头盔', desc: '一体成型 · 通风透气', price: '¥299', image: '/static/bikes/_______17853702216266_1_.png', tag: '新品' },
  { id: 2, name: '防水骑行包', desc: '15L 容量 · 快拆固定', price: '¥169', image: '/static/bikes/_______17853704716480_1_.png', tag: '精选' },
  { id: 3, name: '智能车锁', desc: '蓝牙解锁 · 异动提醒', price: '¥199', image: '/static/bikes/image-3.png', tag: '热销' },
  { id: 4, name: '户外补能灯', desc: 'USB-C 充电 · 三档亮度', price: '¥129', image: '/static/bikes/image-4.png', tag: '配件' },
]
let bannerTimer
let productTimer

const posts = ref([
  { id: 1, user: '骑行小队长', avatar: '骑', time: '10分钟前', content: '今天骑途能T87D去夫子庙，太阳能充电真的好用！全程12km零电费，碳积分+120，推荐大家试试🌿', tags: ['#骑行日记', '#碳积分'], likes: 248, comments: 32, color: '#1a7a4a' },
  { id: 2, user: '绿色通勤侠', avatar: '绿', time: '38分钟前', content: '上班路上用途能拍了个日出，绿色出行真的治愈💚 今日减碳318g，相当于种了半棵树🌳', tags: ['#绿色通勤', '#低碳生活'], likes: 189, comments: 17, color: '#4aade8' },
  { id: 3, user: '碳中和先锋', avatar: '碳', time: '1小时前', content: '本月已骑行86km，累计减碳5.27kg，离“绿色先锋”徽章只差0.73kg了！大家一起冲 💪', tags: ['#成就解锁', '#打卡挑战'], likes: 312, comments: 44, color: '#a78bfa' },
])
const currentProduct = computed(() => products[productIndex.value])
const currentPlan = computed(() => plans.find((item) => item.id === plan.value) || plans[0])
const showPosts = computed(() => carbonSubTab.value === 'following' ? posts.value.filter(item => followedPosts.value.includes(item.id)) : posts.value)

onMounted(() => {
  bannerTimer = setInterval(() => bannerIndex.value = (bannerIndex.value + 1) % banners.length, 3500)
  productTimer = setInterval(() => productIndex.value = (productIndex.value + 1) % products.length, 3000)
})
onBeforeUnmount(() => { clearInterval(bannerTimer); clearInterval(productTimer) })
function toast(title) {
  if (title === '历史行程加载中') return openPanel('rides')
  if (title === '积分明细加载中') return openDetail('points')
  if (title === '会员权益') return openDetail('level')
  showWotToast({ msg: title, duration: 1800 })
  return
  uni.showToast({ title, icon: 'none' })
}
function setTab(tab) { activeTab.value = tab; profilePanel.value = ''; detailPage.value = '' }
async function handleWechatLogin() {
  if (loginLoading.value) return
  loginLoading.value = true
  try {
    user.value = await loginWithWechat()
    isLoggedIn.value = true
    toast('微信登录成功')
  } catch (error) {
    uni.showModal({ title: '微信登录', content: error?.message || '登录失败，请稍后重试', showCancel: false })
  } finally {
    loginLoading.value = false
  }
}
function handleLogout() {
  clearLogin()
  user.value = previewUser
  isLoggedIn.value = true
  profilePanel.value = ''
  detailPage.value = ''
  toast('当前为已登录预览模式')
}
function requireLogin() { return true }
function chooseBanner(index) { bannerIndex.value = index }
function chooseProduct(index) { productIndex.value = index }
function onProductChange(event) { productIndex.value = event.detail.current }
function openShop(tab = 'vehicles') { shopTab.value = tab; activeTab.value = 'shop'; profilePanel.value = ''; detailPage.value = '' }
function openQuickAction(index) { if (index === 0) setTab('rental'); else if (index === 1) openShop('vehicles'); else if (index === 2) openShop('accessories'); else setTab('carbon') }
function openProduct(index) { productIndex.value = index; openShop('vehicles') }
function goProduct(delta) { productIndex.value = (productIndex.value + delta + products.length) % products.length }
function toggleRedeem(id) { if (!redeemed.value.includes(id)) redeemed.value.push(id); toast('兑换成功，已存入权益包') }
function toggleLike(post) { const index = likedPosts.value.indexOf(post.id); if (index === -1) { likedPosts.value.push(post.id); post.likes += 1 } else { likedPosts.value.splice(index, 1); post.likes -= 1 } }
function toggleFollow(id) { const index = followedPosts.value.indexOf(id); if (index === -1) followedPosts.value.push(id); else followedPosts.value.splice(index, 1) }
function scan() { toast('请在微信小程序中授权相机扫码') }
function openPanel(panel) { if (!requireLogin('查看个人服务')) return; profilePanel.value = panel; detailPage.value = ''; selectedItem.value = null }
function openDetail(page, item = null) { detailPage.value = page; selectedItem.value = item }
function closeDetail() { detailPage.value = ''; selectedItem.value = null }
function removeFavorite(id) { favoriteItems.value = favoriteItems.value.filter(item => item.id !== id); toast('已取消收藏') }
function submitRepair() { if (!repairDescription.value.trim()) return toast('请先填写故障描述'); repairDescription.value = ''; toast('报修申请已提交') }
function askService(text) { chatMessages.value.push({ role: 'user', text }); setTimeout(() => chatMessages.value.push({ role: 'bot', text: text === '车辆故障' ? '请先确认车辆编号和故障现象，在线报修会为你安排最近的服务站。' : text === '积分兑换' ? '积分兑换成功后会自动存入权益包，可在订单或碳资产页查看。' : '租赁按实际骑行时长计费，临时锁车不结束订单。' }), 250) }
function openRideHistory() { openPanel('rides') }
function openPointsLedger() { openDetail('points') }
function openMemberBenefits() { openDetail('level') }
const detailTitle = computed(() => ({
  points: '积分明细', level: '会员等级权益', carbonWallet: '碳积分钱包', vehicleDetail: '车辆详情', favoriteDetail: '收藏详情',
  repairForm: '在线报修', repairRecords: '维修记录', rideDetail: '骑行详情', rideOrder: '骑行订单详情', purchaseOrder: '购车订单详情',
}[detailPage.value] || ''))
const panelContent = computed(() => ({
  orders: { title: '我的订单', image: '/static/bikes/_1__T87D.jpg', rows: [['TN202608120001', 'T87D 太阳能助力车', '待收货'], ['TN202608120004', '夫子庙 → 新街口 · 12.4 km', '已完成']] },
  wallet: { title: '碳积分钱包', image: '', rows: [['当前可用积分', '8,620 pts', '黄金骑士'], ['今日骑行奖励', '+862 pts', '已到账'], ['积分兑换记录', '骑行优惠券', '已使用']] },
  vehicle: { title: '我的车辆', image: '/static/bikes/____T87D-__.jpg', rows: [['途能 T87D', '皓月白 · 标准版', '车辆健康良好'], ['太阳能补能', '今日已补能 1.8 kWh', '运行正常']] },
  favorites: { title: '我的收藏', image: '/static/bikes/_______17853702216266_1_.png', rows: [['T87D 极光粉', '太阳能电动车', '¥4,999'], ['环保骑行头盔', '轻量透气设计', '¥299']] },
  repair: { title: '在线报修', image: '/static/bikes/_______17853704716480_1_.png', rows: [['车辆故障报修', '填写故障类型与描述', '立即提交'], ['维修记录', '上次保养：2026/07/12', '查看记录']] },
  service: { title: '智能客服', image: '', rows: [['途能小助手', '您好，请问有什么可以帮您？', '在线'], ['常见问题', '租赁、充电、售后服务', '查看全部']] },
  rides: { title: '骑行记录', image: '/static/bikes/_______17853941021932_1_.png', rows: [['2026/08/12', '夫子庙 → 新街口 · 36分钟', '12.4 km'], ['2026/08/05', '中华门 → 秦淮河 · 27分钟', '6.8 km']] }
})[profilePanel.value] || { title: '', image: '', rows: [] })
</script>

<template>
  <view class="tuneng-app" :style="{ backgroundImage: `url(${assets.bg})` }">
    <wd-toast /><view class="wash" />
    <scroll-view class="content" scroll-y :show-scrollbar="false">
      <view v-if="activeTab === 'home'" class="home-tab">
        <view class="home-header"><view class="brand-mark">途</view><view class="location"><view><image class="figma-icon header-mini-icon" src="/static/icons/map-pin.png" mode="aspectFit" /> 南京 · 夫子庙 <image class="figma-icon header-mini-icon" src="/static/icons/chevron-right.png" mode="aspectFit" /></view><text>途能绿色出行</text></view><view class="notice" @click="toast('暂无新消息')"><image class="figma-icon notice-icon" src="/static/icons/bell.png" mode="aspectFit" /><i /></view></view>
        <view class="search"><image class="figma-icon search-icon" src="/static/icons/search.png" mode="aspectFit" /><input v-model="searchText" placeholder="搜索整车、配件、门店..." /><view class="qr" @click="scan"><image class="figma-icon qr-icon" src="/static/icons/qr-code.png" mode="aspectFit" /></view></view>
        <view class="banner-wrap"><view v-for="(banner, index) in banners" :key="banner.title" v-show="bannerIndex === index" class="banner"><image :src="banner.image" mode="aspectFill" /><view class="banner-mask" /><view class="banner-text"><text>{{ banner.tag }}</text><b>{{ banner.title }}</b><em>{{ banner.copy }}</em><wd-button @click="toast(banner.action)">{{ banner.action }}</wd-button></view></view></view>
        <view class="dots"><text v-for="(_, index) in banners" :key="index" :class="{ on: bannerIndex === index }" @click="chooseBanner(index)" /></view>
        <view class="section-label">快捷服务</view><view class="quick-actions"><view v-for="(item, index) in quickActions" :key="item.label" @click="openQuickAction(index)"><view :style="{ color: item.color, borderColor: item.color + '55' }" :class="{ core: index === 0 || index === 3 }"><image v-if="index === 0" class="figma-icon quick-icon" src="/static/icons/qr-code.png" mode="aspectFit" /><image v-else-if="index === 1" class="figma-icon quick-icon" src="/static/icons/bike.png" mode="aspectFit" /><image v-else-if="index === 2" class="figma-icon quick-icon" src="/static/icons/shopping-bag.png" mode="aspectFit" /><image v-else class="figma-icon quick-icon" src="/static/icons/leaf.png" mode="aspectFit" /></view><text>{{ item.label }}</text></view></view>
        <view class="section-label">我的出行</view><view class="dual-cards"><view class="glass-card"><view class="card-title"><text>⌖ 附近可用车辆</text><em @click="setTab('rental')">查看地图 ›</em></view><view class="mini-map"><i v-for="index in 3" :key="index" :class="`pin p${index}`" /><b /></view><view v-for="spot in nearbySpots" :key="spot.name" class="spot"><text>● {{ spot.name }}</text><em>{{ spot.count }}辆 {{ spot.dist }}</em></view></view><view class="glass-card carbon-card"><view class="card-title"><text>↗ 骑行碳减排</text></view><view class="ring"><b>68%</b><text>今日目标</text></view><view class="stat"><text>◉ 今日里程</text><b>12.4 km</b></view><view class="stat"><text>♧ 累计减碳</text><b>8.62 kg</b></view><view class="stat"><text>★ 碳积分</text><b>+862 pts</b></view></view></view>
        <view class="section-label">热门整车</view><view class="product-stage"><view class="product-arrow" @click="goProduct(-1)">‹</view><swiper class="product-swiper" :current="productIndex" circular :previous-margin="'104rpx'" :next-margin="'104rpx'" :duration="380" easing-function="easeOutCubic" @change="onProductChange"><swiper-item v-for="(item, index) in products" :key="item.name"><view class="product-card" :class="{ 'is-center': productIndex === index }" :style="{ background: item.bg }" @click="openProduct(index)"><text :style="{ color: item.accent }">{{ item.tag }}</text><image :src="item.image" mode="aspectFit" /><b>途能 T87D</b><em>{{ item.name }} · {{ item.edition }}</em><view>¥4,999 <small>立即选购 ›</small></view></view></swiper-item></swiper><view class="product-arrow" @click="goProduct(1)">›</view></view><view class="product-dots"><text v-for="(_, index) in products" :key="index" :class="{ on: productIndex === index }" @click="chooseProduct(index)" /></view>
      </view>

      <view v-else-if="activeTab === 'rental'" class="rental-tab"><view class="page-head"><view><b>共享租赁</b><text>附近共 18 辆可用</text></view><em>◈ 已投保</em></view><view class="rental-map"><view class="map-grid" /><i v-for="index in 7" :key="index" :class="`bike-pin bp${index}`">⛟</i><view class="here">●</view><view class="map-caption">南京 · 夫子庙</view><wd-button @click="toast('已刷新附近车辆')">↻ 刷新</wd-button></view><view class="sub-label">🔥 当前订单</view><view class="active-ride"><view class="ride-row"><view><b>TN-20240725</b><text>正在骑行 · 夫子庙南广场</text></view><em>骑行中</em></view><view class="ride-stats"><view><b>14:07</b><text>骑行时长</text></view><view><b>3.6</b><text>已骑公里</text></view><view><b>¥2.00</b><text>当前费用</text></view></view><view class="ride-progress"><i /><text>太阳能补能中 · 电量 86%</text></view></view><view class="sub-label">购买套餐</view><view class="plan-selector"><view v-for="item in plans" :key="item.id" :class="{ active: plan === item.id }" @click="plan = item.id">{{ item.name }}</view></view><view class="plan-detail" :key="currentPlan.id"><view class="plan-summary"><view><view class="plan-price"><b>{{ currentPlan.price }}</b><em>{{ currentPlan.unit }}</em></view><text>{{ currentPlan.validity }}</text></view><view class="plan-badge">{{ currentPlan.badge }}</view></view><view class="plan-benefits"><view v-for="benefit in currentPlan.benefits" :key="benefit"><wd-icon name="check-circle" :size="14" /><text>{{ benefit }}</text></view></view><wd-button class="plan-buy-button" @click="toast('购买功能即将开放')"><text>立即购买</text><wd-icon name="arrow-right" size="18" /></wd-button></view><view class="history" @click="toast('历史行程加载中')">◷ 查看历史行程 ›</view></view>

      <view v-else-if="activeTab === 'carbon'" class="carbon-tab"><view class="carbon-title"><text>CARBON ASSETS</text><b>碳资产</b></view><view class="carbon-hero"><view class="orbit">◌</view><view class="hero-head"><view><text>CARBON ASSETS</text><b>我的碳资产</b></view><em>♧</em></view><view class="carbon-stats"><view><text>✦</text><b>8,620</b><small>pts</small><i>总碳积分</i></view><view><text>◉</text><b>247</b><small>km</small><i>骑行里程</i></view><view><text>♧</text><b>12</b><small>棵</small><i>等效植树</i></view></view><view class="eco-tip">☀ 本月减排相当于驾车少行驶 <b>186 km</b></view></view><view class="wallet"><view><text>碳积分钱包</text><b>8,620 pts</b></view><wd-button @click="toast('积分明细加载中')">查看明细 ›</wd-button></view><view class="carbon-store-entry" @click="openShop('points')"><view><text>碳积分兑换</text><b>去商城兑换专属好礼</b></view><wd-icon name="gift" :size="27" /><wd-icon name="arrow-right" size="19" /></view><view class="section-label">骑行记录</view><view class="records"><view v-for="record in records" :key="record.date" class="record"><view><b>{{ record.date }}</b><text>{{ record.time }} · {{ record.route }}</text></view><view><b>{{ record.km }} km</b><text>{{ record.pts }} pts · {{ record.carbon }}</text></view></view></view><view class="section-label">成就徽章</view><view class="badges"><view v-for="badge in badges" :key="badge.label" :class="{ locked: !badge.on }"><b>{{ badge.icon }}</b><text>{{ badge.label }}</text><small>{{ badge.desc }}</small></view></view></view>

      <view v-else-if="activeTab === 'shop'" class="shop-tab"><view class="shop-header"><wd-button class="shop-back" @click="setTab('home')"><wd-icon name="arrow-left" size="22" /></wd-button><view><text>TUNENG STORE</text><b>途能商城</b></view><wd-button class="shop-bag" @click="toast('购物车功能即将开放')"><wd-icon name="cart" size="23" /></wd-button></view><view class="shop-tabs"><view v-for="item in [{ id: 'vehicles', label: '整车选购' }, { id: 'accessories', label: '配件商城' }, { id: 'points', label: '积分兑换' }]" :key="item.id" :class="{ active: shopTab === item.id }" @click="shopTab = item.id">{{ item.label }}</view></view><template v-if="shopTab === 'vehicles'"><view class="shop-vehicle-hero" :style="{ background: currentProduct.bg }"><view><text>太阳能智能助力车</text><b>途能 T87D</b><em>{{ currentProduct.name }} · {{ currentProduct.edition }}</em><strong>¥4,999</strong></view><image :src="currentProduct.image" mode="aspectFit" /></view><view class="shop-spec-grid"><view><wd-icon name="dashboard" :size="18" /><b>40 km</b><text>储能续航</text></view><view><wd-icon name="chart-pie" :size="18" /><b>10-20 km</b><text>光能续航/天</text></view><view><wd-icon name="secured" :size="18" /><b>2 年</b><text>整车质保</text></view></view><view class="shop-section-head"><b>选择颜色</b><text>点击切换实车图</text></view><scroll-view class="vehicle-choice-row" scroll-x :show-scrollbar="false"><view v-for="(item, index) in products" :key="item.name" :class="{ selected: productIndex === index }" @click="chooseProduct(index)"><image :src="item.image" mode="aspectFit" /><b>{{ item.name }}</b><text>{{ item.edition }}</text></view></scroll-view><view class="shop-info-list"><view><text>太阳能补能</text><b>高效单晶硅面板 · 弱光持续补能</b></view><view><text>智能出行</text><b>北斗定位 · NFC 解锁 · 异动提醒</b></view><view><text>交付服务</text><b>免费送货上门 · 首年基础保养</b></view></view><wd-button class="shop-main-action" @click="toast('购买功能即将开放')"><text>立即选购</text><wd-icon name="arrow-right" size="19" /></wd-button></template><template v-else-if="shopTab === 'accessories'"><view class="shop-section-head accessory-head"><b>精选骑行装备</b><text>让每一次出行更从容</text></view><view class="accessory-grid"><view v-for="item in shopAccessories" :key="item.id" class="accessory-card"><view class="accessory-image"><image :src="item.image" mode="aspectFit" /><text>{{ item.tag }}</text></view><b>{{ item.name }}</b><small>{{ item.desc }}</small><view><strong>{{ item.price }}</strong><wd-button @click="toast('已加入购物车')"><wd-icon name="cart" size="17" /></wd-button></view></view></view></template><template v-else><view class="points-store-hero"><view><text>CARBON POINTS</text><b>8,620 <small>pts</small></b><em>绿色出行，兑换更多好礼</em></view><wd-icon name="money-circle" :size="42" /></view><view class="shop-section-head accessory-head"><b>积分好礼</b><text>兑换后自动存入权益包</text></view><view class="points-grid"><view v-for="item in mallItems" :key="item.id" class="points-item"><view :style="{ color: item.color, background: item.color + '18' }">{{ item.icon }}</view><b>{{ item.name }}</b><small>{{ item.desc }}</small><view><strong>{{ item.pts }} pts</strong><wd-button :disabled="redeemed.includes(item.id)" @click="toggleRedeem(item.id)">{{ redeemed.includes(item.id) ? '已兑换' : '兑换' }}</wd-button></view></view></view></template></view>

      <view v-else-if="activeTab === 'community'" class="community-tab"><view class="community-head"><view><text>GREEN COMMUNITY</text><b>绿色社区</b></view><wd-button @click="toast('发布功能即将开放')">＋ 发布</wd-button></view><scroll-view class="community-nav" scroll-x :show-scrollbar="false"><text v-for="item in [{ id: 'recommended', label: '推荐' }, { id: 'following', label: '关注' }, { id: 'challenge', label: '话题挑战' }, { id: 'video', label: '科普视频' }]" :key="item.id" :class="{ active: carbonSubTab === item.id }" @click="carbonSubTab = item.id">{{ item.label }}</text></scroll-view><view v-if="carbonSubTab === 'challenge'" class="challenge"><view><b>🌿 本周骑行打卡挑战</b><text>完成5次骑行 · 赢双倍碳积分奖励</text></view><wd-button @click="toast('已报名打卡挑战')">去参与</wd-button></view><view v-if="carbonSubTab === 'video'" class="videos"><view v-for="item in ['5分钟了解碳中和', '电助力 vs 燃油车：谁更省钱', '城市骑行安全指南']" :key="item"><view>▶</view><b>{{ item }}</b><text>科普视频 · 4.2万观看</text></view></view><view v-else-if="!showPosts.length" class="empty">还没有关注的骑友，去推荐页看看吧</view><view v-else class="posts"><view v-for="post in showPosts" :key="post.id" class="post"><view class="post-user"><i :style="{ background: post.color }">{{ post.avatar }}</i><view><b>{{ post.user }}</b><text>{{ post.time }}</text></view><wd-button @click="toggleFollow(post.id)">{{ followedPosts.includes(post.id) ? '✓ 已关注' : '+ 关注' }}</wd-button></view><view class="post-body">{{ post.content }}</view><view class="post-photo" :style="{ background: `linear-gradient(135deg, ${post.color}, #c6e7ce)` }">低碳 · 骑行日记</view><view class="tags"><text v-for="tag in post.tags" :key="tag">{{ tag }}</text></view><view class="post-actions"><text @click="toggleLike(post)">{{ likedPosts.includes(post.id) ? '♥' : '♡' }} {{ post.likes }}</text><text @click="toast('评论功能即将开放')">◌ {{ post.comments }}</text><text @click="toast('已收藏')">⌑ 收藏</text></view></view></view></view>

      <view v-else class="profile-tab">
        <view v-if="!isLoggedIn" class="profile-login-card">
          <view class="profile-login-orbit"><wd-icon name="user" :size="36" /></view>
          <view class="profile-login-copy"><b>登录途能，开启绿色出行</b><text>同步骑行记录、碳积分和会员权益</text></view>
          <wd-button class="wechat-login-button" :disabled="loginLoading" @click="handleWechatLogin"><text v-if="!loginLoading">微信登录</text><text v-else>登录中...</text></wd-button>
        </view>
        <template v-else>
          <view class="profile-hero"><view class="profile-orbit">◌</view><view class="profile-top"><view class="avatar"><image v-if="user?.avatar" :src="user.avatar" mode="aspectFill" /><text v-else>{{ (user?.nickname || '途').slice(0, 1) }}</text></view><view><b>{{ user?.nickname || '微信用户' }}</b><text>途能ID: {{ user?.user_id || user?.userId || '已绑定' }}</text><em><wd-icon name="star" :size="10" /> {{ user?.member_level || '绿色会员' }}</em></view><wd-button @click="openDetail('level')"><wd-icon name="star" :size="13" /> 会员权益 <wd-icon name="arrow-right" :size="12" /></wd-button></view><view class="profile-stats"><view><b>{{ user?.total_km || 0 }}</b><text>km</text><small>累计里程</small></view><view><b>{{ user?.points || 0 }}</b><text>pts</text><small>碳积分</small></view><view><b>{{ user?.trees || 0 }}</b><text>棵</text><small>等效植树</small></view></view></view>
          <view class="profile-quick"><view v-for="item in [{ label: '我的订单', id: 'orders' }, { label: '碳积分钱包', id: 'wallet' }, { label: '我的车辆', id: 'vehicle' }, { label: '我的收藏', id: 'favorites' }]" :key="item.id" @click="openPanel(item.id)"><b><wd-icon name="goods" v-if="item.id === 'orders'" :size="22" /><wd-icon name="wallet" v-else-if="item.id === 'wallet'" :size="22" /><wd-icon name="location" v-else-if="item.id === 'vehicle'" :size="22" /><wd-icon name="star" v-else :size="22" /></b><text>{{ item.label }}</text></view></view>
          <view class="profile-group"><small>业务服务</small><view v-for="item in [{ title: '在线报修', desc: '快速提交故障申请', id: 'repair' }, { title: '智能客服', desc: '7×24小时智能响应', id: 'service' }, { title: '骑行记录', desc: '查看全部出行数据', id: 'rides' }]" :key="item.id" @click="openPanel(item.id)"><b><wd-icon name="tools" v-if="item.id === 'repair'" :size="19" /><wd-icon name="chat" v-else-if="item.id === 'service'" :size="19" /><wd-icon name="location" v-else :size="19" /></b><view><strong>{{ item.title }}</strong><text>{{ item.desc }}</text></view><em><wd-icon name="arrow-right" size="18" /></em></view></view>
          <view class="profile-group"><small>通用设置</small><view v-for="item in [{ title: '地址管理', desc: '常用地点与停车点', icon: 'address' }, { title: '隐私设置', desc: '数据授权与权限管理', icon: 'privacy' }, { title: '关于途能', desc: 'v2.4.1 · 检查更新', icon: 'about' }]" :key="item.title" @click="toast(item.title)"><b><wd-icon name="location" v-if="item.icon === 'address'" :size="19" /><wd-icon name="help-circle" v-else-if="item.icon === 'privacy'" :size="19" /><wd-icon name="chart-pie" v-else :size="19" /></b><view><strong>{{ item.title }}</strong><text>{{ item.desc }}</text></view><em><wd-icon name="arrow-right" size="18" /></em></view></view>
          <wd-button class="logout-button" @click="handleLogout">退出登录</wd-button>
        </template>
      </view>
    </scroll-view>

    <wd-button v-if="activeTab === 'rental'" class="scan-button" @click="scan"><view class="scan-button-content"><image class="figma-icon scan-icon" src="/static/icons/qr-code-white.png" mode="aspectFit" /><text>扫码开锁</text></view></wd-button>
    <view class="bottom-nav"><view v-for="item in [{ id: 'home', label: '首页' }, { id: 'rental', label: '租车' }, { id: 'carbon', label: '碳资产' }, { id: 'community', label: '社区' }, { id: 'profile', label: '我的' }]" :key="item.id" :class="{ active: activeTab === item.id, carbon: item.id === 'carbon' }" @click="setTab(item.id)"><b><image v-if="item.id === 'profile'" class="figma-icon nav-icon" src="/static/icons/circle-user-round.png" mode="aspectFit" /><image v-else-if="item.id === 'community'" class="figma-icon nav-icon" src="/static/icons/message-circle.png" mode="aspectFit" /><image v-else-if="item.id === 'carbon'" class="figma-icon nav-carbon-icon" src="/static/icons/leaf-white.png" mode="aspectFit" /><image v-else-if="item.id === 'rental'" class="figma-icon nav-icon" src="/static/icons/bike.png" mode="aspectFit" /><image v-else class="figma-icon nav-icon" src="/static/icons/home.png" mode="aspectFit" /></b><text>{{ item.label }}</text></view></view>
    <view v-if="profilePanel" class="modal" @click="profilePanel = ''"><view class="detail-panel secondary-shell" @click.stop><view class="detail-nav"><wd-button @click="profilePanel = ''"><wd-icon name="arrow-left" :size="20" /></wd-button><b>{{ panelContent.title }}</b><view /></view>
      <view v-if="profilePanel === 'orders'"><view class="order-tabs"><text v-for="item in [{id:'all',label:'全部'},{id:'purchase',label:'购车订单'},{id:'ride',label:'骑行订单'}]" :key="item.id" :class="{active:orderFilter===item.id}" @click="orderFilter=item.id">{{item.label}}</text></view><view class="order-card" v-if="orderFilter !== 'ride'" @click="openDetail('purchaseOrder')"><image src="/static/bikes/_1__T87D.jpg" mode="aspectFill"/><view><em>待收货</em><b>途能 T87D 太阳能助力车</b><text>皓月白 · 标准版 · 订单 TN202608120001</text><strong>实付 ¥4,999.00</strong></view></view><view class="order-card" v-if="orderFilter !== 'purchase'" @click="openDetail('rideOrder')"><view class="order-bike"><wd-icon name="location" :size="30" /></view><view><em class="done">已完成</em><b>夫子庙 → 新街口</b><text>2026/08/12 08:32 · 骑行 36 分钟</text><strong>¥6.00 · 12.4 km</strong></view></view></view>
      <view v-else-if="profilePanel === 'wallet'"><view class="points-hero"><wd-icon name="money-circle" :size="28" /><text>可用碳积分</text><b>8,620</b><small>本月已获得 +1,286 pts</small></view><view class="action-grid"><view @click="openDetail('points')"><wd-icon name="note" :size="21" /><text>积分明细</text></view><view @click="openDetail('level')"><wd-icon name="star-on" :size="21" /><text>等级权益</text></view><view @click="openDetail('carbonWallet')"><wd-icon name="wallet" :size="21" /><text>碳资产钱包</text></view></view><view class="section-title">最近积分变动</view><view class="ledger-row" v-for="item in [['骑行奖励','今天 08:32','+52'],['绿色出行周挑战','昨天 18:06','+120'],['兑换骑行优惠券','07月25日','-120']]" :key="item[0]"><view><b>{{item[0]}}</b><text>{{item[1]}}</text></view><em :class="{minus:item[2].startsWith('-')}">{{item[2]}} pts</em></view></view>
      <view v-else-if="profilePanel === 'vehicle'"><view class="vehicle-hero"><image src="/static/bikes/____T87D-__.jpg" mode="aspectFit"/><view><b>途能 T87D</b><text>皓月白 · 标准版</text><em><wd-icon name="check-circle" :size="14" /> 车辆健康良好</em></view></view><view class="metric-grid"><view><b>86%</b><text>当前电量</text></view><view><b>1.8</b><text>今日补能 kWh</text></view><view><b>247</b><text>累计里程 km</text></view></view><wd-button class="detail-action" @click="openDetail('vehicleDetail')">查看车辆详情</wd-button></view>
      <view v-else-if="profilePanel === 'favorites'"><view class="favorite-card" v-for="item in favoriteItems" :key="item.id"><image :src="item.image" mode="aspectFit" @click="openDetail('favoriteDetail',item)"/><view @click="openDetail('favoriteDetail',item)"><b>{{item.name}}</b><text>{{item.type}}</text><strong>{{item.price}}</strong></view><wd-button @click="removeFavorite(item.id)"><wd-icon name="delete" :size="17" /></wd-button></view><view v-if="!favoriteItems.length" class="empty-state"><wd-icon name="heart" :size="35" /><text>暂无收藏商品</text></view></view>
      <view v-else-if="profilePanel === 'repair'"><view class="service-banner"><wd-icon name="tools" :size="28" /><view><b>车辆需要帮助？</b><text>在线提交故障，服务站会尽快联系你</text></view></view><view class="service-row" @click="openDetail('repairForm')"><view><b>在线报修</b><text>填写故障情况并提交申请</text></view><wd-icon name="arrow-right" :size="20" /></view><view class="service-row" @click="openDetail('repairRecords')"><view><b>维修记录</b><text>查看保养、维修和服务进度</text></view><wd-icon name="arrow-right" :size="20" /></view></view>
      <view v-else-if="profilePanel === 'service'"><view class="chat"><view class="chat-welcome">你好，我是途能智能客服</view><view class="chat-bubble">我可以协助处理租赁、补能、报修、积分和订单问题。</view><view v-for="(message,index) in chatMessages" :key="index" :class="message.role === 'user' ? 'chat-user' : 'chat-bubble'">{{message.text}}</view><view class="chat-options"><text @click="askService('租车规则')">租车规则</text><text @click="askService('车辆故障')">车辆故障</text><text @click="askService('积分兑换')">积分兑换</text></view></view></view>
      <view v-else-if="profilePanel === 'rides'"><view class="ride-summary"><view><b>247.3</b><text>累计骑行 km</text></view><view><b>12.68</b><text>累计减碳 kg</text></view><view><b>38</b><text>骑行次数</text></view></view><view class="ride-list" v-for="ride in [{date:'2026/08/12',route:'夫子庙 → 新街口',time:'08:32 - 09:08',km:'12.4 km',fee:'¥6.00'},{date:'2026/08/05',route:'中华门 → 秦淮河',time:'17:48 - 18:15',km:'6.8 km',fee:'¥4.00'}]" :key="ride.date" @click="openDetail('rideDetail',ride)"><view class="ride-icon"><wd-icon name="location" :size="20" /></view><view><b>{{ride.route}}</b><text>{{ride.date}} · {{ride.time}}</text></view><em>{{ride.km}}<small>{{ride.fee}}</small></em></view></view>
    </view></view>
    <view v-if="detailPage" class="modal page-detail" @click="closeDetail"><scroll-view scroll-y class="full-detail" @click.stop><view class="full-nav"><wd-button @click="closeDetail"><wd-icon name="arrow-left" size="20" /></wd-button><b>{{detailTitle}}</b><view /></view>
      <view v-if="detailPage === 'points'"><view class="points-detail-head"><b>8,620</b><text>当前可用积分</text><view class="point-tabs"><text :class="{active:pointFilter==='all'}" @click="pointFilter='all'">全部</text><text :class="{active:pointFilter==='income'}" @click="pointFilter='income'">收入</text><text :class="{active:pointFilter==='spend'}" @click="pointFilter='spend'">支出</text></view></view><view class="ledger-row" v-for="item in [['骑行碳积分奖励','2026/08/12 09:08','+52'],['连续骑行挑战奖励','2026/08/11 18:06','+120'],['骑行优惠券兑换','2026/07/25 11:30','-120'],['绿色出行周奖励','2026/07/23 10:14','+300']]" :key="item[0]" v-show="pointFilter==='all'||(pointFilter==='income'?item[2].startsWith('+'):item[2].startsWith('-'))"><view><b>{{item[0]}}</b><text>{{item[1]}}</text></view><em :class="{minus:item[2].startsWith('-')}">{{item[2]}} pts</em></view></view>
      <view v-else-if="detailPage === 'level'"><view class="level-hero"><wd-icon name="star-on" :size="30" /><b>黄金骑士</b><text>再获得 1,380 pts 升至钻石骑士</text><view><i/><i/><i/><i class="off"/></view></view><view class="section-title">当前等级权益</view><view class="benefit-row" v-for="item in [['租车折扣','租赁订单享 9.2 折'],['优先客服','专属服务通道'],['生日礼遇','生日月双倍碳积分'],['活动资格','优先报名绿色骑行活动']]" :key="item[0]"><wd-icon name="gift" :size="20" /><view><b>{{item[0]}}</b><text>{{item[1]}}</text></view></view></view>
      <view v-else-if="detailPage === 'carbonWallet'"><view class="carbon-wallet-hero"><wd-icon name="chart-pie" :size="29" /><text>累计减碳</text><b>12.68 <small>kg</small></b><view><text>等效植树 12 棵</text><text>绿色里程 247 km</text></view></view><view class="wallet-stats"><view><b>8,620</b><text>碳积分</text></view><view><b>38</b><text>低碳出行</text></view></view><view class="section-title">碳资产凭证</view><view class="certificate"><wd-icon name="secured" :size="26" /><view><b>2026 年度绿色出行凭证</b><text>已记录 12.68 kg 碳减排量</text></view><wd-icon name="check-circle" :size="20" /></view></view>
      <view v-else-if="detailPage === 'vehicleDetail'"><image src="/static/bikes/____T87D-__.jpg" class="detail-bike" mode="aspectFit"/><view class="info-block"><b>车辆基础信息</b><view v-for="item in [['车架编号','TN87D20260812001'],['购买日期','2026/06/18'],['质保到期','2028/06/17'],['最近保养','2026/07/12']]" :key="item[0]"><text>{{item[0]}}</text><em>{{item[1]}}</em></view></view><view class="info-block"><b>太阳能补能数据</b><view><text>今日补能</text><em>1.8 kWh</em></view><view><text>累计发电</text><em>42.6 kWh</em></view></view></view>
      <view v-else-if="detailPage === 'favoriteDetail' && selectedItem"><image :src="selectedItem.image" class="detail-bike" mode="aspectFit"/><view class="product-info"><text>{{selectedItem.type}}</text><b>{{selectedItem.name}}</b><strong>{{selectedItem.price}}</strong><view class="feature-pills"><text>正品保障</text><text>7 天无理由</text><text>绿色配送</text></view><wd-button class="detail-action" @click="toast('已加入购物车')">加入购物车</wd-button></view></view>
      <view v-else-if="detailPage === 'repairForm'"><view class="repair-detail"><text>故障类型</text><view class="repair-types"><text v-for="item in ['车辆无法开锁','制动异响','电池续航异常','其他问题']" :key="item" :class="{active:repairType===item}" @click="repairType=item">{{item}}</text></view><text>故障描述</text><textarea v-model="repairDescription" placeholder="请描述车辆异常情况，例如发生时间、故障现象等"/><text>服务车辆</text><view class="bound-vehicle"><wd-icon name="location" :size="22" /><view><b>途能 T87D</b><small>车架号 TN87D20260812001</small></view></view><wd-button class="detail-action" @click="submitRepair">提交报修申请</wd-button></view></view>
      <view v-else-if="detailPage === 'repairRecords'"><view class="repair-record" v-for="item in [['2026/07/12','常规保养','已完成','更换刹车皮，完成制动系统检查'],['2026/06/20','太阳能面板检测','已完成','面板发电效率正常'],['2026/05/03','首次交付检查','已完成','车辆交付前安全检查']]" :key="item[0]"><i></i><view><b>{{item[1]}}</b><text>{{item[0]}} · {{item[3]}}</text></view><em>{{item[2]}}</em></view></view>
      <view v-else-if="detailPage === 'rideDetail' && selectedItem"><view class="ride-detail-hero"><wd-icon name="location" :size="33" /><b>{{selectedItem.km}}</b><text>{{selectedItem.route}}</text><small>{{selectedItem.date}} {{selectedItem.time}}</small></view><view class="info-block"><b>本次行程</b><view><text>骑行时长</text><em>36 分钟</em></view><view><text>订单费用</text><em>{{selectedItem.fee}}</em></view><view><text>获得积分</text><em>+52 pts</em></view><view><text>减少碳排放</text><em>318 g</em></view></view></view>
      <view v-else-if="detailPage === 'rideOrder'"><view class="order-detail-hero"><wd-icon name="location" :size="32" /><b>订单已完成</b><text>夫子庙 → 新街口</text></view><view class="info-block"><b>订单信息</b><view v-for="item in [['订单编号','TN202608120004'],['骑行时长','36 分钟'],['骑行里程','12.4 km'],['支付金额','¥6.00'],['支付方式','碳积分抵扣 + 微信支付']]" :key="item[0]"><text>{{item[0]}}</text><em>{{item[1]}}</em></view></view></view>
      <view v-else-if="detailPage === 'purchaseOrder'"><view class="order-detail-hero"><wd-icon name="goods" :size="32" /><b>等待收货</b><text>订单 TN202608120001</text></view><image src="/static/bikes/_1__T87D.jpg" class="purchase-image" mode="aspectFill"/><view class="info-block"><b>配送信息</b><view><text>收货人</text><em>林小绿 138****2088</em></view><view><text>配送地址</text><em>南京市秦淮区夫子庙街道</em></view><view><text>预计送达</text><em>2026/08/16 前</em></view><view><text>商品金额</text><em>¥4,999.00</em></view></view></view>
    </scroll-view></view>
  </view>
</template>
