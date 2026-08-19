import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardPage from '../views/DashboardPage.vue'
import DataListPage from '../views/DataListPage.vue'
import SettingsPage from '../views/SettingsPage.vue'
import LoginPage from '../views/LoginPage.vue'
import AdminsPage from '../views/AdminsPage.vue'
import UsersPage from '../views/UsersPage.vue'
import MerchantsPage from '../views/MerchantsPage.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginPage, meta: { public: true } },
  {
    path: '/',
    component: AdminLayout,
    children: [
      { path: '', name: 'dashboard', component: DashboardPage, meta: { title: '运营概览' } },
      { path: 'users', name: 'users', component: UsersPage, meta: { title: '用户管理' } },
      { path: 'vehicles', name: 'vehicles', component: DataListPage, meta: { title: '车辆管理', resource: 'vehicles' } },
      { path: 'stations', name: 'stations', component: DataListPage, meta: { title: '停车点管理', resource: 'stations' } },
      { path: 'orders', name: 'orders', component: DataListPage, meta: { title: '订单管理', resource: 'orders' } },
      { path: 'products', name: 'products', component: DataListPage, meta: { title: '商品管理', resource: 'products' } },
      { path: 'community', name: 'community', component: DataListPage, meta: { title: '社区内容', resource: 'community' } },
      { path: 'repairs', name: 'repairs', component: DataListPage, meta: { title: '报修工单', resource: 'repairs' } },
      { path: 'admins', name: 'admins', component: AdminsPage, meta: { title: '管理员账号' } },
      { path: 'merchants', name: 'merchants', component: MerchantsPage, meta: { title: '商家管理' } },
      { path: 'settings', name: 'settings', component: SettingsPage, meta: { title: '系统设置' } }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => {
  const token = localStorage.getItem('tuneng_admin_token')
  if (!to.meta.public && !token) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && token) return { name: 'dashboard' }
})

export default router
