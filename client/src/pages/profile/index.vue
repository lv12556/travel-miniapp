<script setup>
const menu = [{ title: '我的预约', icon: '▣' }, { title: '我的收藏', icon: '♡' }, { title: '联系客服', icon: '◌' }]
function selectMenu(title) { uni.showToast({ title: `${title}功能即将开放`, icon: 'none' }) }
</script>

<template>
  <view class="page profile"><view class="profile-head"><view class="avatar">山</view><view><view class="name">旅行者</view><view class="description">记录每一次出发</view></view></view><view class="menu"><view v-for="item in menu" :key="item.title" class="menu-row" @click="selectMenu(item.title)"><text class="menu-icon">{{ item.icon }}</text><text>{{ item.title }}</text><text class="arrow">›</text></view></view><view class="hint">登录与订单同步将在接入账户服务后开放</view></view>
</template>

<style scoped lang="scss">
.profile { padding: 42rpx 32rpx; }.profile-head { display: flex; align-items: center; padding: 36rpx 26rpx; border-radius: 8rpx; background: #1e5a45; color: #fff; }.avatar { display: flex; align-items: center; justify-content: center; width: 94rpx; height: 94rpx; margin-right: 24rpx; border-radius: 50%; background: #e5b779; color: #1e5a45; font-size: 36rpx; font-weight: 700; }.name { font-size: 35rpx; font-weight: 700; }.description { margin-top: 10rpx; color: #c9dbd0; font-size: 24rpx; }.menu { margin-top: 24rpx; overflow: hidden; border-radius: 8rpx; background: #fff; }.menu-row { display: flex; align-items: center; height: 106rpx; padding: 0 25rpx; border-bottom: 1rpx solid #edf0eb; font-size: 28rpx; }.menu-row:last-child { border: 0; }.menu-icon { width: 52rpx; color: #1e5a45; font-size: 32rpx; }.arrow { margin-left: auto; color: #a0a79e; font-size: 35rpx; }.hint { margin-top: 42rpx; color: #91988f; text-align: center; font-size: 23rpx; }
</style>
