<script setup>
import { computed, onMounted, ref } from 'vue'
import { Search, Refresh, Download, View, Lock, Unlock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../services/admin-api'
import { exportCsv } from '../utils/export-csv'

const rows = ref([]); const loading = ref(false); const keyword = ref(''); const total = ref(0); const page = ref(1); const detail = ref(null); const pageSize = 10
const load = async () => { loading.value = true; try { const result = await adminApi.users({ page: page.value, pageSize, keyword: keyword.value || undefined }); rows.value = result.items || []; total.value = result.total || 0 } catch (error) { ElMessage.error(error.message) } finally { loading.value = false } }
const toggle = async (row) => { try { await ElMessageBox.confirm(`${row.status ? '冻结' : '解冻'}用户“${row.nickname || row.phone || row.user_id}”？`, '确认操作', { type: 'warning' }); await adminApi.updateUserStatus(row.user_id, row.status ? 0 : 1); ElMessage.success('账号状态已更新'); load() } catch (error) { if (!['cancel', 'close'].includes(error)) ElMessage.error(error.message) } }
const columns = [['nickname', '昵称'], ['phone', '手机号'], ['created_at', '注册时间'], ['status', '状态']]
const download = () => exportCsv('途能用户列表.csv', columns, rows.value)
const avatar = (row) => row.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(row.nickname || '用户')}`
onMounted(load)
</script>

<template>
  <section class="page-head"><div><h1>用户管理</h1><p>搜索用户资料，查看详情并冻结或解冻账号。</p></div><div class="head-actions"><el-button :icon="Download" @click="download">导出 Excel</el-button><el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button></div></section>
  <el-card shadow="never"><div class="table-toolbar"><el-input v-model="keyword" :prefix-icon="Search" placeholder="搜索昵称 / 手机号" clearable @keyup.enter="page = 1; load()" /><span>共 {{ total }} 位用户</span></div><el-table :data="rows" v-loading="loading" stripe><el-table-column label="用户" min-width="210"><template #default="scope"><div class="user-cell"><el-avatar :size="32" :src="avatar(scope.row)" /><span>{{ scope.row.nickname || '未设置昵称' }}</span></div></template></el-table-column><el-table-column prop="phone" label="手机号" min-width="140" /><el-table-column prop="created_at" label="注册时间" min-width="170" /><el-table-column prop="status" label="账号状态" width="120"><template #default="scope"><el-tag :type="Number(scope.row.status) ? 'success' : 'danger'">{{ Number(scope.row.status) ? '正常' : '冻结' }}</el-tag></template></el-table-column><el-table-column label="操作" width="170" fixed="right"><template #default="scope"><el-button link type="primary" :icon="View" @click="detail = scope.row">详情</el-button><el-button link :type="Number(scope.row.status) ? 'danger' : 'success'" :icon="Number(scope.row.status) ? Lock : Unlock" @click="toggle(scope.row)">{{ Number(scope.row.status) ? '冻结' : '解冻' }}</el-button></template></el-table-column></el-table><div class="pagination"><el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="load" /></div></el-card>
  <el-drawer v-model="detail" title="用户详情" size="380px"><el-descriptions v-if="detail" :column="1" border><el-descriptions-item label="用户 ID">{{ detail.user_id }}</el-descriptions-item><el-descriptions-item label="昵称">{{ detail.nickname || '-' }}</el-descriptions-item><el-descriptions-item label="手机号">{{ detail.phone || '-' }}</el-descriptions-item><el-descriptions-item label="会员等级">{{ detail.member_level || '-' }}</el-descriptions-item><el-descriptions-item label="积分">{{ detail.points ?? 0 }}</el-descriptions-item><el-descriptions-item label="注册时间">{{ detail.created_at }}</el-descriptions-item></el-descriptions></el-drawer>
</template>
