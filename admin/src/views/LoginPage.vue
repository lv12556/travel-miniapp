<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '../services/admin-api'

const route = useRoute()
const router = useRouter()
const form = ref({ username: '', password: '' })
const remember = ref(true)
const loading = ref(false)
onMounted(() => { form.value.username = localStorage.getItem('tuneng_admin_remembered_username') || '' })
const submit = async () => {
  loading.value = true
  try {
    const result = await adminApi.login(form.value)
    localStorage.setItem('tuneng_admin_token', result.accessToken)
    if (remember.value) localStorage.setItem('tuneng_admin_remembered_username', form.value.username)
    else localStorage.removeItem('tuneng_admin_remembered_username')
    ElMessage.success(`欢迎回来，${result.admin.username}`)
    router.replace(String(route.query.redirect || '/'))
  } catch (error) { ElMessage.error(error.message) } finally { loading.value = false }
}
</script>

<template>
  <main class="login-page"><section class="login-aside"><div class="login-brand"><span>T</span><strong>途能运营管理台</strong></div><div><p class="eyebrow">TUNENG OPERATIONS</p><h1>让每一次绿色出行<br />都有可靠的运营支持。</h1><p>统一管理小程序的车辆、停车点、订单、商品、社区和报修数据。</p></div><small>与途能小程序共用同一个后端 API 与数据库</small></section><section class="login-panel"><el-card shadow="never" class="login-card"><h2>管理员登录</h2><p>请输入服务端配置的管理员账号。</p><el-form :model="form" @submit.prevent="submit"><el-form-item><el-input v-model="form.username" :prefix-icon="User" autocomplete="username" placeholder="管理员账号" /></el-form-item><el-form-item><el-input v-model="form.password" :prefix-icon="Lock" autocomplete="current-password" show-password type="password" placeholder="管理员密码" @keyup.enter="submit" /></el-form-item><div class="login-options"><el-checkbox v-model="remember">记住账号</el-checkbox><el-button link type="primary" @click="ElMessage.info('请联系超级管理员重置密码')">忘记密码？</el-button></div><el-button type="primary" size="large" class="login-submit" :loading="loading" @click="submit">登录管理台</el-button></el-form></el-card></section></main>
</template>
