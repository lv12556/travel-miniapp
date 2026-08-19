<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, User, Van, Location, Tickets, Goods, ChatDotRound, Tools, Shop, Setting, Expand, Fold, SwitchButton } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const title = computed(() => route.meta.title || '途能运营管理台')
const menus = [
  { path: '/', label: '运营概览', icon: DataAnalysis },
  { path: '/users', label: '用户管理', icon: User },
  { path: '/vehicles', label: '车辆管理', icon: Van },
  { path: '/stations', label: '停车点管理', icon: Location },
  { path: '/orders', label: '订单管理', icon: Tickets },
  { path: '/products', label: '商品管理', icon: Goods },
  { path: '/community', label: '社区内容', icon: ChatDotRound },
  { path: '/repairs', label: '报修工单', icon: Tools },
  { path: '/merchants', label: '商家管理', icon: Shop },
  { path: '/admins', label: '管理员账号', icon: Setting },
  { path: '/settings', label: '系统设置', icon: Setting }
]
const logout = () => { localStorage.removeItem('tuneng_admin_token'); appStore.admin = null; router.replace({ name: 'login' }) }
</script>

<template>
  <el-container class="admin-shell">
    <el-aside :width="appStore.collapsed ? '64px' : '220px'" class="sidebar">
      <div class="brand"><span class="brand-mark">T</span><strong v-show="!appStore.collapsed">途能运营</strong></div>
      <el-menu :default-active="route.path" :collapse="appStore.collapsed" :collapse-transition="false" router background-color="transparent" text-color="#b9c5bd" active-text-color="#ffffff">
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon><template #title>{{ item.label }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="topbar">
        <div class="topbar-left"><el-button text :icon="appStore.collapsed ? Expand : Fold" @click="appStore.collapsed = !appStore.collapsed" /><span>{{ title }}</span></div>
        <div class="topbar-right"><el-tag :type="appStore.apiOnline === false ? 'danger' : 'success'" effect="light">{{ appStore.apiOnline === false ? '后端未连接' : '统一数据源' }}</el-tag><el-avatar :size="30">管</el-avatar><span>{{ appStore.admin?.username || '运营管理员' }}</span><el-button text :icon="SwitchButton" title="退出登录" @click="logout" /></div>
      </el-header>
      <el-main class="workspace"><RouterView /></el-main>
    </el-container>
  </el-container>
</template>
