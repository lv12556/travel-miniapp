<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Location, Goods, Connection, Warning, TrendCharts } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const router = useRouter()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1'
const cards = computed(() => [
  { label: '今日订单数', value: appStore.overview.todayOrders ?? 0, note: '今日骑行 + 销售订单', icon: Connection, tone: 'green' },
  { label: '今日营收', value: `¥${(Number(appStore.overview.todayRevenueCents || 0) / 100).toFixed(2)}`, note: '已支付订单金额', icon: Goods, tone: 'orange' },
  { label: '总用户数', value: appStore.overview.users, note: '正常状态用户', icon: Location, tone: 'violet' },
  { label: '在线车辆数', value: appStore.overview.onlineVehicles ?? appStore.overview.vehicles, note: '可用 + 使用中', icon: Warning, tone: 'blue' }
])
const trend = computed(() => appStore.overview.orderTrend || [])
const trendMax = computed(() => Math.max(1, ...trend.value.map((item) => Number(item.value) || 0)))
const trendPoints = computed(() => trend.value.map((item, index) => ({ ...item, x: trend.value.length === 1 ? 300 : 32 + index * (536 / (trend.value.length - 1)), y: 184 - ((Number(item.value) || 0) / trendMax.value) * 144 })))
const trendPath = computed(() => trendPoints.value.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '))
const vehicleStatus = computed(() => appStore.overview.vehicleStatus || [])
const statusTotal = computed(() => vehicleStatus.value.reduce((sum, item) => sum + Number(item.value || 0), 0))
const statusGradient = computed(() => {
  const colors = ['#55a96d', '#f2ad58', '#8d9aa0', '#d66d67']; let cursor = 0
  return `conic-gradient(${vehicleStatus.value.map((item, index) => { const start = cursor; cursor += (Number(item.value || 0) / Math.max(1, statusTotal.value)) * 360; return `${colors[index % colors.length]} ${start}deg ${cursor}deg` }).join(', ')})`
})
const stationAvailability = computed(() => appStore.overview.stationAvailability || [])
const stationMax = computed(() => Math.max(1, ...stationAvailability.value.map((item) => Number(item.value) || 0)))
const statusLabel = (value) => ({ available: '可用', in_use: '骑行中', maintenance: '维护中', offline: '离线' }[value] || value)
const quickActions = computed(() => [
  { label: '待处理订单', value: appStore.overview.pendingOrders || 0, note: '进入订单列表处理支付和售后', path: '/orders', tone: 'orange' },
  { label: '待处理报修', value: appStore.overview.pendingRepairs || 0, note: '查看工单并推进处理进度', path: '/repairs', tone: 'violet' },
  { label: '待审核商家', value: appStore.overview.pendingMerchants || 0, note: '审核经销商、景区和高校申请', path: '/merchants', tone: 'green' }
])
onMounted(() => appStore.loadOverview())
</script>

<template>
  <section class="page-head"><div><h1>运营概览</h1><p>小程序和管理台使用同一个 Express API 与 MySQL 数据库。</p></div><el-button :icon="Refresh" :loading="appStore.loading" @click="appStore.loadOverview">刷新数据</el-button></section>
  <el-alert title="已使用独立管理员 Token 访问后台接口。普通小程序用户 Token 无法读取后台全量数据。" type="success" :closable="false" show-icon />
  <div class="metric-grid"><article v-for="card in cards" :key="card.label" class="metric-card"><div :class="['metric-icon', card.tone]"><el-icon><component :is="card.icon" /></el-icon></div><div><p>{{ card.label }}</p><strong>{{ card.value }}</strong><small>{{ card.note }}</small></div></article></div>

  <section class="analytics-grid">
    <el-card shadow="never" class="chart-card trend-card"><template #header><div class="card-title"><span>近 7 日订单趋势</span><el-tag type="success" effect="plain"><el-icon><TrendCharts /></el-icon> 骑行 + 购买</el-tag></div></template><div v-if="trend.length" class="line-chart"><svg viewBox="0 0 600 220" role="img" aria-label="近七日订单趋势图"><line v-for="y in [40, 88, 136, 184]" :key="y" x1="32" :y1="y" x2="568" :y2="y" class="chart-grid-line" /><path :d="trendPath" class="trend-line" /><circle v-for="point in trendPoints" :key="point.label" :cx="point.x" :cy="point.y" r="4.5" class="trend-dot" /><text v-for="point in trendPoints" :key="`${point.label}-label`" :x="point.x" y="208" text-anchor="middle" class="chart-axis-label">{{ point.label }}</text><text v-for="point in trendPoints" :key="`${point.label}-value`" :x="point.x" :y="point.y - 12" text-anchor="middle" class="chart-value-label">{{ point.value }}</text></svg></div><el-empty v-else description="暂无订单趋势数据" :image-size="70" /></el-card>
    <el-card shadow="never" class="chart-card status-card"><template #header><div class="card-title"><span>车辆状态分布</span><el-tag type="info" effect="plain">{{ statusTotal }} 辆</el-tag></div></template><div v-if="vehicleStatus.length" class="status-chart"><div class="donut" :style="{ background: statusGradient }"><div><strong>{{ statusTotal }}</strong><span>车辆总数</span></div></div><div class="status-legend"><div v-for="(item, index) in vehicleStatus" :key="item.label" class="legend-item"><i :class="`legend-dot dot-${index % 4}`"></i><span>{{ statusLabel(item.label) }}</span><strong>{{ item.value }}</strong></div></div></div><el-empty v-else description="暂无车辆状态数据" :image-size="70" /></el-card>
    <el-card shadow="never" class="chart-card station-card"><template #header><div class="card-title"><span>停车点可用车辆</span><span class="muted-label">按可用车辆数排序</span></div></template><div v-if="stationAvailability.length" class="station-bars"><div v-for="item in stationAvailability" :key="item.label" class="station-bar"><div class="station-bar-head"><span>{{ item.label }}</span><strong>{{ item.value }} 辆</strong></div><div class="bar-track"><i :style="{ width: `${(Number(item.value || 0) / stationMax) * 100}%` }"></i></div></div></div><el-empty v-else description="暂无停车点数据" :image-size="70" /></el-card>
    <el-card shadow="never" class="chart-card insight-card"><template #header><div class="card-title"><span>运营摘要</span><el-tag type="warning" effect="plain">今日关注</el-tag></div></template><div class="insight-list"><div><span>车辆可用率</span><strong>{{ statusTotal ? Math.round((Number(vehicleStatus.find((item) => item.label === 'available')?.value || 0) / statusTotal) * 100) : 0 }}%</strong></div><div><span>待处理报修</span><strong class="warning-text">{{ appStore.overview.pendingRepairs }} 单</strong></div><div><span>商品上架数</span><strong>{{ appStore.overview.products }} 件</strong></div><div><span>隐藏帖子</span><strong>{{ appStore.overview.hiddenPosts }} 条</strong></div></div></el-card>
  </section>
  <section class="quick-section"><div class="section-caption"><h2>快捷入口</h2><span>优先处理待办事项</span></div><div class="quick-grid"><button v-for="item in quickActions" :key="item.path" class="quick-card" @click="router.push(item.path)"><span :class="['quick-badge', item.tone]">{{ item.value }}</span><span class="quick-copy"><strong>{{ item.label }}</strong><small>{{ item.note }}</small></span><span class="quick-arrow">→</span></button></div></section>

  <el-row :gutter="18"><el-col :xs="24" :lg="15"><el-card shadow="never"><template #header><div class="card-title"><span>后台能力</span><el-tag type="success" effect="plain">管理员权限已启用</el-tag></div></template><el-steps direction="vertical" :active="4"><el-step title="管理员登录" description="管理员密码以 scrypt 哈希保存，登录 Token 有效期为 8 小时。" /><el-step title="统一 API" description="管理台和小程序使用同一个 Express 后端与 MySQL 数据库。" /><el-step title="全量数据管理" description="车辆、停车点、订单、商品、社区、报修均从管理员接口读取。" /><el-step title="后续运营能力" description="下一步可补管理员操作日志展示、发货、退款、库存与内容审核策略。" /></el-steps></el-card></el-col><el-col :xs="24" :lg="9"><el-card shadow="never" class="source-card"><template #header>当前数据源</template><dl><dt>后端</dt><dd>{{ apiBaseUrl }}</dd><dt>数据库</dt><dd>tuneng_db（与小程序共用）</dd><dt>当前管理员</dt><dd>{{ appStore.admin?.username || '-' }}</dd><dt>最后刷新</dt><dd>{{ appStore.updatedAt || '尚未获取' }}</dd></dl></el-card></el-col></el-row>
</template>
