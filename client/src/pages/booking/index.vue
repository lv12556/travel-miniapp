<script setup>
import { onMounted, ref } from 'vue'
import { getVehicle, getStations, unlockVehicle } from '../../services/vehicle'

const vehicle = ref(null)
const stations = ref([])
const stationIndex = ref(0)
const loading = ref(false)
onMounted(async () => { const pages = getCurrentPages(); const id = pages[pages.length - 1].options.id; [vehicle.value, stations.value] = await Promise.all([getVehicle(id), getStations()]) })
async function confirm() { if (!vehicle.value) return; loading.value = true; try { await unlockVehicle(vehicle.value.vehicle_id); uni.showModal({ title: '车辆已预约', content: `请前往${stations.value[stationIndex.value]?.zone_name || '停车点'}扫码开锁。`, showCancel: false, success: () => uni.switchTab({ url: '/pages/home/index' }) }) } finally { loading.value = false } }
</script>

<template>
  <view class="page booking"><view class="notice">预约后将为你保留车辆 15 分钟</view><view v-if="vehicle" class="bike"><image :src="vehicle.image" mode="aspectFit" /><view><b>{{ vehicle.model_name }}</b><text>{{ vehicle.bike_number }} · 电量 {{ vehicle.battery_level }}%</text></view></view><view class="section"><view class="section-title">选择取车点</view><view v-for="(item, index) in stations" :key="item.zone_id" :class="['station', { selected: stationIndex === index }]" @click="stationIndex = index"><view><b>{{ item.zone_name }}</b><text>{{ Math.round(item.distance_meters || 0) }}m · 可用 {{ item.available_vehicles }} 辆</text></view><text>{{ stationIndex === index ? '●' : '○' }}</text></view></view><view class="section"><view class="section-title">骑行须知</view><view class="rule"><text>✓</text>请在指定停车点取还车辆</view><view class="rule"><text>✓</text>骑行结束后锁车即自动结算</view><view class="rule"><text>✓</text>绿色骑行可获得碳积分奖励</view></view><view class="price"><text>计费规则</text><view>¥2.00 起步价（30 分钟）<text>超时后 ¥0.15 / 分钟</text></view></view><button class="confirm" :loading="loading" @click="confirm">确认预约取车</button></view>
</template>

<style scoped lang="scss">
.booking{min-height:100vh;padding:28rpx;background:#f5f8f2}.notice{padding:18rpx 24rpx;border-radius:12rpx;background:#e5f2e5;color:#377c4d;font-size:22rpx}.bike,.station,.price{display:flex;align-items:center;background:#fff}.bike{gap:20rpx;margin-top:20rpx;padding:18rpx;border-radius:16rpx}.bike image{width:170rpx;height:150rpx;background:#edf4ea}.bike b,.bike text{display:block}.bike b{font-size:30rpx}.bike text{margin-top:12rpx;color:#788578;font-size:21rpx}.section{margin-top:30rpx}.section-title{font-size:30rpx;font-weight:700}.station{justify-content:space-between;margin-top:15rpx;padding:24rpx;border:2rpx solid transparent;border-radius:15rpx}.station.selected{border-color:#299055;background:#f5fbf5}.station b,.station text{display:block}.station b{font-size:26rpx}.station view text{margin-top:9rpx;color:#718071;font-size:20rpx}.station>text{color:#278c50;font-size:31rpx}.rule{margin-top:16rpx;color:#60705f;font-size:23rpx}.rule text{margin-right:12rpx;color:#299156}.price{justify-content:space-between;margin-top:35rpx;padding:24rpx;border-radius:15rpx}.price>text{font-size:25rpx;font-weight:700}.price view{color:#e1872e;font-size:22rpx;text-align:right}.price view text{display:block;margin-top:7rpx;color:#7c897d;font-size:19rpx}.confirm{margin-top:42rpx;border-radius:16rpx;background:#258a50;color:#fff;font-size:29rpx;line-height:88rpx}
</style>
