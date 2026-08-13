<script setup>
import { computed, onMounted, ref } from 'vue'
import { getNearbyVehicles, getStations } from '../../services/vehicle'

const keyword = ref('')
const tab = ref('全部')
const vehicles = ref([])
const stations = ref([])
const categories = ['全部', '高电量', '500m 内', '舒适座舱']
const shown = computed(() => vehicles.value.filter((item) => {
  const word = keyword.value.trim().toLowerCase()
  const matchesText = !word || `${item.model_name}${item.bike_number}${item.color_name}`.toLowerCase().includes(word)
  const matchesTab = tab.value === '全部' || (tab.value === '高电量' && item.battery_level >= 80) || (tab.value === '500m 内' && item.distance_meters <= 500) || (tab.value === '舒适座舱' && item.model_name.includes('City'))
  return matchesText && matchesTab
}))
onMounted(async () => { [vehicles.value, stations.value] = await Promise.all([getNearbyVehicles(), getStations()]) })
function openDetail(id) { uni.navigateTo({ url: `/pages/detail/index?id=${id}` }) }
</script>

<template>
  <view class="page discover">
    <view class="map"><view class="map-grid" /><view class="map-copy"><text>附近有 {{ vehicles.length || 4 }} 辆可骑</text><view>陆家嘴 · 当前位置</view></view><view v-for="(station, index) in stations" :key="station.zone_id" class="pin" :class="`pin-${index}`">{{ station.available_vehicles }}</view></view>
    <view class="sheet"><view class="handle" /><view class="search"><text>⌕</text><input v-model="keyword" placeholder="搜索车辆编号或车型" /></view><scroll-view scroll-x class="tabs" :show-scrollbar="false"><text v-for="item in categories" :key="item" :class="{ active: tab === item }" @click="tab = item">{{ item }}</text></scroll-view><view v-if="!shown.length" class="empty">没有匹配的可骑车辆</view><view v-for="item in shown" :key="item.vehicle_id" class="vehicle" @click="openDetail(item.vehicle_id)"><image :src="item.image" mode="aspectFit" /><view class="vehicle-text"><view><b>{{ item.model_name }}</b><text class="battery">{{ item.battery_level }}%</text></view><text>{{ item.bike_number }} · {{ item.color_name }}</text><view class="distance">{{ Math.round(item.distance_meters) }}m <text>立即选车 ›</text></view></view></view></view>
  </view>
</template>

<style scoped lang="scss">
.discover{min-height:100vh;background:#edf5ec}.map{position:relative;height:490rpx;overflow:hidden;background:linear-gradient(140deg,#cde3cb,#a8d0b5)}.map-grid{position:absolute;inset:0;opacity:.38;background-image:linear-gradient(90deg,transparent 49%,#fff 50%,transparent 51%),linear-gradient(0deg,transparent 49%,#fff 50%,transparent 51%);background-size:100rpx 100rpx;transform:rotate(-12deg) scale(1.2)}.map-copy{position:absolute;top:72rpx;left:32rpx;color:#205c3c}.map-copy text{font-size:32rpx;font-weight:700}.map-copy view{margin-top:9rpx;font-size:23rpx}.pin{position:absolute;display:grid;width:58rpx;height:58rpx;place-items:center;border:7rpx solid #fff;border-radius:50%;background:#258956;color:#fff;font-size:22rpx;box-shadow:0 6rpx 15rpx rgba(15,72,39,.24)}.pin-0{left:410rpx;top:160rpx}.pin-1{right:100rpx;top:280rpx}.pin-2{left:140rpx;bottom:72rpx}.sheet{position:relative;margin-top:-35rpx;padding:18rpx 28rpx 46rpx;border-radius:30rpx 30rpx 0 0;background:#f7faf5}.handle{width:64rpx;height:7rpx;margin:0 auto 18rpx;border-radius:8rpx;background:#ccdbcc}.search{display:flex;align-items:center;padding:0 20rpx;height:75rpx;border-radius:14rpx;background:#fff;color:#6c866f}.search text{margin-right:13rpx;font-size:32rpx}.search input{flex:1;font-size:25rpx}.tabs{margin:22rpx -28rpx;white-space:nowrap}.tabs text{display:inline-block;margin-left:28rpx;padding:12rpx 18rpx;border-radius:22rpx;background:#ecf2ea;color:#718472;font-size:22rpx}.tabs text:last-child{margin-right:28rpx}.tabs .active{background:#247f4b;color:#fff}.vehicle{display:flex;margin-top:17rpx;padding:12rpx;border-radius:16rpx;background:#fff}.vehicle image{width:170rpx;height:158rpx;background:#edf5ea}.vehicle-text{display:flex;flex:1;flex-direction:column;padding:13rpx 12rpx}.vehicle-text b{font-size:29rpx}.vehicle-text>text{margin-top:11rpx;color:#718072;font-size:21rpx}.battery{float:right;padding:5rpx 12rpx;border-radius:12rpx;background:#e6f7e9;color:#21804b;font-size:18rpx}.distance{margin-top:auto;color:#7a8d7d;font-size:20rpx}.distance text{float:right;color:#268a52}.empty{padding:80rpx 0;color:#788778;text-align:center;font-size:26rpx}
</style>
