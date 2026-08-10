<script setup>
import { computed, ref, onMounted } from 'vue'
import { getDestinations } from '../../services/destination'
import { destinations as fallback } from '../../data/fallback'

const tabs = ['全部', '自然风光', '人文漫游', '户外体验']
const activeTab = ref('全部')
const keyword = ref('')
const items = ref(fallback)
const loading = ref(false)

const displayed = computed(() => items.value.filter((item) => {
  const typeMatch = activeTab.value === '全部' || item.category === activeTab.value
  const word = keyword.value.trim()
  return typeMatch && (!word || `${item.title}${item.city}`.includes(word))
}))

async function load() {
  loading.value = true
  try { items.value = await getDestinations() } catch (_) { /* Fall back to bundled preview data. */ }
  loading.value = false
}
function chooseTab(tab) { activeTab.value = tab }
function openDetail(id) { uni.navigateTo({ url: `/pages/detail/index?id=${id}` }) }
onMounted(load)
</script>

<template>
  <view class="page list-page">
    <view class="search"><text class="search-icon">⌕</text><input v-model="keyword" placeholder="搜索目的地、城市" confirm-type="search" /></view>
    <scroll-view scroll-x class="tabs" :show-scrollbar="false"><text v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="chooseTab(tab)">{{ tab }}</text></scroll-view>
    <view v-if="loading" class="state">正在加载目的地...</view>
    <view v-else-if="!displayed.length" class="state">没有找到匹配的目的地</view>
    <view v-else class="result-list"><view v-for="item in displayed" :key="item.id" class="result" @click="openDetail(item.id)"><image :src="item.image" mode="aspectFill" /><view class="result-body"><view class="tag">{{ item.category }}</view><view class="result-title">{{ item.title }}</view><view class="result-meta">{{ item.city }} · {{ item.duration }}</view><view class="result-footer"><text>¥{{ item.price }} 起</text><text>★ {{ item.rating }}</text></view></view></view></view>
  </view>
</template>

<style scoped lang="scss">
.list-page { padding: 28rpx 32rpx; }.search { display: flex; align-items: center; height: 82rpx; padding: 0 24rpx; border-radius: 8rpx; background: #fff; }.search-icon { margin-right: 16rpx; color: #687168; font-size: 38rpx; }.search input { flex: 1; font-size: 27rpx; }.tabs { margin: 26rpx -32rpx 22rpx; white-space: nowrap; }.tab { display: inline-block; margin-left: 32rpx; padding: 12rpx 0; color: #7a8177; font-size: 27rpx; }.tab:last-child { margin-right: 32rpx; }.tab.active { border-bottom: 4rpx solid #1e5a45; color: #1e5a45; font-weight: 700; }.result-list { display: grid; gap: 22rpx; }.result { display: flex; overflow: hidden; min-height: 220rpx; border-radius: 8rpx; background: #fff; }.result image { width: 246rpx; flex: 0 0 246rpx; }.result-body { display: flex; flex: 1; flex-direction: column; padding: 22rpx; }.result-title { margin-top: 12rpx; font-size: 31rpx; font-weight: 700; }.result-meta { margin-top: 9rpx; color: #7b8379; font-size: 23rpx; }.result-footer { display: flex; justify-content: space-between; margin-top: auto; color: #e17a42; font-size: 23rpx; }.result-footer text:last-child { color: #687168; }.state { padding: 120rpx 0; color: #80877d; text-align: center; font-size: 27rpx; }
</style>
