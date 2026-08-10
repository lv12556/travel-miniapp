<script setup>
import { ref, onMounted } from 'vue'
import { getFeatured } from '../../services/destination'
import { destinations as fallback } from '../../data/fallback'

const featured = ref(fallback)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try { featured.value = await getFeatured() } catch (_) { /* Offline preview uses local data. */ }
  loading.value = false
})

function openDetail(id) { uni.navigateTo({ url: `/pages/detail/index?id=${id}` }) }
function openList() { uni.switchTab({ url: '/pages/list/index' }) }
</script>

<template>
  <view class="page">
    <view class="hero">
      <image class="hero-image" :src="featured[0]?.image" mode="aspectFill" />
      <view class="hero-shade" />
      <view class="hero-content">
        <view class="brand">山野时光</view>
        <view class="hero-title">去自然里，找回呼吸的节奏</view>
        <view class="hero-copy">精选小众目的地与在地体验</view>
        <button class="hero-action" @click="openList">开始探索</button>
      </view>
    </view>

    <view class="section categories">
      <view class="section-heading"><text class="section-title">本周推荐</text><text class="more" @click="openList">全部目的地 ›</text></view>
      <scroll-view scroll-x class="destination-row" :show-scrollbar="false">
        <view v-for="item in featured" :key="item.id" class="destination-card" @click="openDetail(item.id)">
          <image :src="item.image" class="card-image" mode="aspectFill" />
          <view class="card-body"><view class="tag">{{ item.category }}</view><view class="card-title">{{ item.title }}</view><view class="card-meta">{{ item.city }} · {{ item.duration }}</view><view class="card-footer"><text>¥{{ item.price }} 起</text><text>★ {{ item.rating }}</text></view></view>
        </view>
      </scroll-view>
    </view>

    <view class="section service">
      <view class="section-title">安心出行</view>
      <view class="service-grid"><view><text class="service-icon">◌</text><view>在地领队</view><text>熟悉每一条小路</text></view><view><text class="service-icon">⌂</text><view>品质住宿</view><text>甄选舒适落脚点</text></view><view><text class="service-icon">◎</text><view>行程保障</view><text>出发前全程支持</text></view></view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.hero { position: relative; height: 710rpx; overflow: hidden; background: #173f34; }
.hero-image, .hero-shade { position: absolute; width: 100%; height: 100%; }.hero-shade { background: rgba(12, 35, 28, .4); }
.hero-content { position: relative; z-index: 1; padding: 104rpx 48rpx 0; color: #fff; }.brand { font-size: 29rpx; font-weight: 600; letter-spacing: 6rpx; }.hero-title { width: 500rpx; margin-top: 116rpx; font-size: 54rpx; font-weight: 700; line-height: 1.25; }.hero-copy { margin-top: 22rpx; font-size: 27rpx; }.hero-action { width: 220rpx; margin: 42rpx 0 0; border-radius: 8rpx; background: #fff; color: #1e5a45; font-size: 26rpx; line-height: 74rpx; }
.section-heading { display: flex; align-items: center; justify-content: space-between; }.more { color: #1e5a45; font-size: 24rpx; }.destination-row { margin: 24rpx -32rpx 0; white-space: nowrap; }.destination-card { display: inline-block; width: 484rpx; margin-left: 32rpx; overflow: hidden; white-space: normal; border-radius: 8rpx; background: #fff; vertical-align: top; }.destination-card:last-child { margin-right: 32rpx; }.card-image { width: 100%; height: 290rpx; }.card-body { padding: 20rpx; }.card-title { margin-top: 16rpx; font-size: 31rpx; font-weight: 700; }.card-meta { margin-top: 10rpx; color: #7d847a; font-size: 23rpx; }.card-footer { display: flex; justify-content: space-between; margin-top: 20rpx; color: #e17a42; font-size: 24rpx; }.card-footer text:last-child { color: #5d665d; }
.service { padding-bottom: 30rpx; }.service-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; margin-top: 24rpx; text-align: center; }.service-grid > view { min-height: 190rpx; padding: 26rpx 8rpx; background: #ebf0e7; border-radius: 8rpx; font-size: 25rpx; font-weight: 600; }.service-grid text:last-child { display: block; margin-top: 12rpx; color: #747c72; font-size: 20rpx; font-weight: 400; }.service-icon { display: block; margin-bottom: 13rpx; color: #1e5a45; font-size: 38rpx; }
</style>
