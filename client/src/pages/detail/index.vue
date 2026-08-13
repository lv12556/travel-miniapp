<script setup>
import { onMounted, ref } from 'vue'
import { getVehicle } from '../../services/vehicle'
import { vehicles } from '../../data/fallback'

const vehicle = ref(vehicles[0])
const selectedColor = ref(0)
const liked = ref(false)
const colors = vehicles.filter((item) => item.model_id === vehicle.value.model_id)
onMounted(async () => {
  const pages = getCurrentPages(); const id = pages[pages.length - 1].options.id
  vehicle.value = await getVehicle(id)
  selectedColor.value = Math.max(0, colors.findIndex((item) => item.color_id === vehicle.value.color_id))
})
function pickColor(index) { selectedColor.value = index; vehicle.value = colors[index] || vehicle.value }
function reserve() { uni.navigateTo({ url: `/pages/booking/index?id=${vehicle.value.vehicle_id}` }) }
</script>

<template>
  <view class="page detail"><view class="hero"><image :src="vehicle.image" mode="aspectFit" /><text class="fav" @click="liked = !liked">{{ liked ? '♥' : '♡' }}</text><view class="status">可立即骑行</view></view><view class="content"><view class="title"><view><text>{{ vehicle.model_name }}</text><view>{{ vehicle.bike_number }} · {{ vehicle.color_name }}</view></view><text class="battery">电量 {{ vehicle.battery_level }}%</text></view><text class="description">{{ vehicle.model_desc }}</text><view class="feature-row"><view><b>太阳能</b><text>绿色补能</text></view><view><b>约 45km</b><text>预计续航</text></view><view><b>智能锁</b><text>一键开锁</text></view></view><view class="block-title">选择颜色</view><view class="colors"><view v-for="(item, index) in colors" :key="item.color_id" :class="{ chosen: selectedColor === index }" @click="pickColor(index)"><text :style="{ background: item.color_code }" /><view>{{ item.color_name }}</view></view></view><view class="station"><text>◎</text><view><b>推荐取车点</b><text>万象城南门停车点 · {{ Math.round(vehicle.distance_meters) }}m</text></view><text>›</text></view></view><view class="bottom"><view><text>起步价</text><b>¥2.00</b><text>/ 30 分钟</text></view><button @click="reserve">预约取车</button></view></view>
</template>

<style scoped lang="scss">
.detail{padding-bottom:132rpx;background:#f6f8f4}.hero{position:relative;height:540rpx;background:radial-gradient(circle at 50% 20%,#f5faf0,#dcebdc)}.hero image{width:100%;height:100%}.fav{position:absolute;top:35rpx;right:32rpx;display:grid;width:66rpx;height:66rpx;place-items:center;border-radius:50%;background:rgba(255,255,255,.85);color:#299155;font-size:43rpx}.status{position:absolute;bottom:28rpx;left:32rpx;padding:10rpx 20rpx;border-radius:20rpx;background:#24884f;color:#fff;font-size:22rpx}.content{padding:30rpx}.title{display:flex;justify-content:space-between}.title>view>text{font-size:43rpx;font-weight:700}.title>view>view,.description{margin-top:12rpx;color:#788678;font-size:23rpx}.battery{height:max-content;padding:8rpx 14rpx;border-radius:14rpx;background:#e5f5e7;color:#21804a;font-size:21rpx}.description{display:block;line-height:1.7}.feature-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12rpx;margin-top:30rpx;padding:23rpx 0;border-top:1rpx solid #dfe8de;border-bottom:1rpx solid #dfe8de}.feature-row view{text-align:center}.feature-row b{font-size:25rpx}.feature-row text{display:block;margin-top:8rpx;color:#819080;font-size:19rpx}.block-title{margin-top:36rpx;font-size:30rpx;font-weight:700}.colors{display:flex;gap:24rpx;margin-top:22rpx}.colors>view{text-align:center;color:#748374;font-size:20rpx}.colors text{display:block;width:52rpx;height:52rpx;margin:0 auto 10rpx;border:4rpx solid #fff;border-radius:50%;box-shadow:0 0 0 1rpx #ccdaca}.colors .chosen text{box-shadow:0 0 0 5rpx #299158}.colors .chosen{color:#26834e;font-weight:700}.station{display:flex;align-items:center;gap:17rpx;margin-top:38rpx;padding:24rpx;border-radius:15rpx;background:#e7f1e7}.station>text:first-child{color:#25894f;font-size:37rpx}.station view{flex:1}.station b,.station text{display:block}.station b{font-size:25rpx}.station view text{margin-top:8rpx;color:#748375;font-size:20rpx}.station>text:last-child{font-size:36rpx;color:#5a8366}.bottom{position:fixed;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:17rpx 28rpx calc(17rpx + env(safe-area-inset-bottom));background:#fff;box-shadow:0 -4rpx 16rpx rgba(38,74,45,.09)}.bottom>view text{font-size:19rpx;color:#798778}.bottom b{margin:0 6rpx;color:#e48a2f;font-size:37rpx}.bottom button{width:245rpx;margin:0;border-radius:15rpx;background:#258a50;color:#fff;font-size:28rpx;line-height:82rpx}
</style>
