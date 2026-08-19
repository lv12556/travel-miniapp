<script setup>
defineProps({ loading: Boolean, error: String, empty: Boolean, emptyText: { type: String, default: '暂无数据' } })
defineEmits(['retry'])
</script>

<template>
  <view v-if="loading" class="async-state"><wd-loading size="22" /><text>加载中...</text></view>
  <view v-else-if="error" class="async-state async-state-error"><wd-icon name="warning" size="24" /><text>{{ error }}</text><wd-button size="small" @click="$emit('retry')">重新加载</wd-button></view>
  <view v-else-if="empty" class="async-state"><wd-icon name="file" size="24" /><text>{{ emptyText }}</text></view>
</template>

<style>
.async-state { min-height: 150rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14rpx; color: #748278; font-size: 24rpx; }
.async-state-error { color: #a65a42; }
.async-state-error .wd-button { margin-top: 6rpx; }
</style>
