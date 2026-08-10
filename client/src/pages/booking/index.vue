<script setup>
import { reactive, ref } from 'vue'
import { createBooking } from '../../services/destination'

const pageStack = getCurrentPages()
const pageOptions = pageStack[pageStack.length - 1].options
const destinationId = Number(pageOptions.id)
const title = decodeURIComponent(pageOptions.title || '目的地')
const submitting = ref(false)
const form = reactive({ name: '', phone: '', date: '', people: 1, note: '' })

function chooseDate(event) { form.date = event.detail.value }
async function submit() {
  if (!form.name.trim() || !/^1\d{10}$/.test(form.phone) || !form.date) { uni.showToast({ title: '请填写姓名、手机号和日期', icon: 'none' }); return }
  submitting.value = true
  try {
    await createBooking({ destinationId, ...form })
    uni.showToast({ title: '预约已提交', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  } catch (error) { uni.showToast({ title: error.message || '提交失败，请稍后重试', icon: 'none' }) }
  finally { submitting.value = false }
}
</script>

<template>
  <view class="page booking"><view class="summary"><text>预约项目</text><view>{{ title }}</view></view><view class="form"><view class="field"><text>联系人</text><input v-model="form.name" placeholder="请输入姓名" /></view><view class="field"><text>手机号</text><input v-model="form.phone" type="number" maxlength="11" placeholder="用于接收确认信息" /></view><view class="field"><text>出行日期</text><picker mode="date" :value="form.date" @change="chooseDate"><view :class="{ placeholder: !form.date }">{{ form.date || '请选择日期' }}</view></picker></view><view class="field"><text>出行人数</text><view class="stepper"><text @click="form.people = Math.max(1, form.people - 1)">−</text><view>{{ form.people }}</view><text @click="form.people++">+</text></view></view><view class="field note"><text>补充说明</text><textarea v-model="form.note" placeholder="如有特殊需求可填写在这里" maxlength="200" /></view></view><button class="primary-button submit" :loading="submitting" @click="submit">提交预约</button></view>
</template>

<style scoped lang="scss">
.booking { padding: 28rpx 32rpx; }.summary { padding: 26rpx; border-radius: 8rpx; background: #e4eee8; color: #1e5a45; font-size: 24rpx; }.summary view { margin-top: 12rpx; color: #24312d; font-size: 32rpx; font-weight: 700; }.form { margin-top: 22rpx; padding: 0 24rpx; border-radius: 8rpx; background: #fff; }.field { display: flex; align-items: center; min-height: 106rpx; border-bottom: 1rpx solid #edf0eb; }.field > text { width: 150rpx; font-size: 27rpx; }.field input, .field picker { flex: 1; font-size: 27rpx; }.placeholder { color: #aaa; }.stepper { display: flex; align-items: center; gap: 28rpx; color: #1e5a45; font-size: 34rpx; }.stepper view { width: 42rpx; color: #24312d; text-align: center; font-size: 27rpx; }.note { align-items: flex-start; padding: 30rpx 0; }.note textarea { flex: 1; height: 150rpx; font-size: 27rpx; }.submit { margin-top: 46rpx; }
</style>
