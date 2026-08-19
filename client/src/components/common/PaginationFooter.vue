<script setup>
defineProps({ loading: Boolean, hasMore: Boolean, empty: Boolean })
defineEmits(['load-more'])
</script>

<template>
  <view v-if="!empty" class="pagination-footer">
    <wd-loading v-if="loading" size="18" /><text v-if="loading">正在加载...</text>
    <wd-button v-else-if="hasMore" size="small" plain @click="$emit('load-more')">加载更多</wd-button>
    <text v-else>没有更多了</text>
  </view>
</template>

<style>
.pagination-footer { min-height: 92rpx; display: flex; align-items: center; justify-content: center; gap: 12rpx; color: #8a958d; font-size: 22rpx; }
</style>
