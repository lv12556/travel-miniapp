<script setup>
import { computed, ref, onMounted } from 'vue'
import { getDestination } from '../../services/destination'
import { destinations } from '../../data/fallback'

const item = ref(destinations[0])
const saved = ref(false)
const id = ref(1)
const highlights = computed(() => ['在地领队带路', '小团轻松出行', '行程灵活可调整'])

onMounted(async () => {
  const pageStack = getCurrentPages()
  id.value = Number(pageStack[pageStack.length - 1].options.id || 1)
  item.value = destinations.find((entry) => entry.id === id.value) || destinations[0]
  try { item.value = await getDestination(id.value) } catch (_) { /* The client remains usable before the API starts. */ }
})
function toggleSaved() { saved.value = !saved.value; uni.showToast({ title: saved.value ? '已收藏' : '已取消收藏', icon: 'none' }) }
function book() { uni.navigateTo({ url: `/pages/booking/index?id=${item.value.id}&title=${encodeURIComponent(item.value.title)}` }) }
</script>

<template>
  <view class="page detail-page">
    <image class="cover" :src="item.image" mode="aspectFill" />
    <view class="content"><view class="tag">{{ item.category }}</view><view class="title-row"><view class="title">{{ item.title }}</view><text class="save" @click="toggleSaved">{{ saved ? '♥' : '♡' }}</text></view><view class="meta">{{ item.city }} · 建议游玩 {{ item.duration }} · ★ {{ item.rating }}</view><view class="intro">沿着当地熟悉的节奏，走进更安静、更有温度的风景。这是一段适合放慢脚步的轻旅行体验。</view>
      <view class="block"><view class="block-title">体验亮点</view><view v-for="highlight in highlights" :key="highlight" class="highlight"><text>✓</text>{{ highlight }}</view></view>
      <view class="block"><view class="block-title">行程说明</view><view class="notice">价格包含基础行程服务。出行日期、人数和特殊需求可在预约时说明，工作人员会在确认前与您沟通。</view></view>
    </view>
    <view class="bottom-bar"><view><text class="price">¥{{ item.price }}</text><text class="unit"> / 人起</text></view><button class="book-button" @click="book">立即预约</button></view>
  </view>
</template>

<style scoped lang="scss">
.detail-page { padding-bottom: 136rpx; }.cover { width: 100%; height: 530rpx; }.content { padding: 30rpx 32rpx; background: #f6f7f2; }.title-row { display: flex; align-items: center; justify-content: space-between; margin-top: 17rpx; }.title { font-size: 44rpx; font-weight: 700; }.save { padding: 6rpx 10rpx; color: #1e5a45; font-size: 52rpx; line-height: 1; }.meta { margin-top: 15rpx; color: #727b70; font-size: 25rpx; }.intro { margin-top: 32rpx; color: #49544c; font-size: 27rpx; line-height: 1.85; }.block { margin-top: 45rpx; padding-top: 28rpx; border-top: 1rpx solid #dde2da; }.block-title { margin-bottom: 22rpx; font-size: 32rpx; font-weight: 700; }.highlight { margin: 16rpx 0; font-size: 27rpx; }.highlight text { display: inline-block; width: 42rpx; color: #1e5a45; }.notice { color: #5d685e; font-size: 26rpx; line-height: 1.8; }.bottom-bar { position: fixed; z-index: 2; right: 0; bottom: 0; left: 0; display: flex; align-items: center; justify-content: space-between; padding: 18rpx 32rpx calc(18rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -3rpx 15rpx rgba(30, 48, 38, .08); }.price { color: #e17a42; font-size: 40rpx; font-weight: 700; }.unit { color: #727b70; font-size: 22rpx; }.book-button { width: 260rpx; margin: 0; border-radius: 8rpx; background: #1e5a45; color: #fff; font-size: 28rpx; line-height: 80rpx; }
</style>
