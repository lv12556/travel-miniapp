<script setup>
import { onMounted, ref } from 'vue'
import { CirclePlus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../services/admin-api'

const rows = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ username: '', password: '', role: 'editor' })
const load = async () => {
  loading.value = true
  try { rows.value = await adminApi.admins() } catch (error) { ElMessage.error(error.message) } finally { loading.value = false }
}
const create = async () => {
  try { await adminApi.createAdmin(form.value); ElMessage.success('管理员已创建'); dialogVisible.value = false; form.value = { username: '', password: '', role: 'editor' }; load() } catch (error) { ElMessage.error(error.message) }
}
const toggle = async (row) => {
  const next = Number(row.status) ? 0 : 1
  try { await ElMessageBox.confirm(`${next ? '启用' : '停用'}管理员“${row.username}”？`, '确认操作', { type: 'warning' }); await adminApi.updateAdminStatus(row.admin_id, next); ElMessage.success('状态已更新'); load() } catch (error) { if (error !== 'cancel' && error !== 'close') ElMessage.error(error.message) }
}
onMounted(load)
</script>

<template>
  <section class="page-head"><div><h1>管理员账号</h1><p>只有超级管理员可以创建和启停账号，密码只在服务端保存哈希。</p></div><div class="head-actions"><el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button><el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增管理员</el-button></div></section>
  <el-card shadow="never"><el-table :data="rows" v-loading="loading" stripe><el-table-column prop="username" label="账号" min-width="180" /><el-table-column prop="role" label="角色" width="160"><template #default="scope"><el-tag :type="scope.row.role === 'super_admin' ? 'danger' : 'info'">{{ scope.row.role === 'super_admin' ? '超级管理员' : '运营编辑' }}</el-tag></template></el-table-column><el-table-column prop="status" label="状态" width="110"><template #default="scope"><el-tag :type="Number(scope.row.status) ? 'success' : 'info'">{{ Number(scope.row.status) ? '启用' : '停用' }}</el-tag></template></el-table-column><el-table-column prop="created_at" label="创建时间" min-width="180" /><el-table-column label="操作" width="110" fixed="right"><template #default="scope"><el-button link type="primary" @click="toggle(scope.row)">{{ Number(scope.row.status) ? '停用' : '启用' }}</el-button></template></el-table-column></el-table></el-card>
  <el-dialog v-model="dialogVisible" title="新增管理员" width="420px"><el-form label-position="top"><el-form-item label="账号"><el-input v-model="form.username" placeholder="3-50 个字符" /></el-form-item><el-form-item label="初始密码"><el-input v-model="form.password" type="password" show-password placeholder="至少 10 位" /></el-form-item><el-form-item label="角色"><el-select v-model="form.role" style="width: 100%"><el-option label="运营编辑" value="editor" /><el-option label="超级管理员" value="super_admin" /></el-select></el-form-item></el-form><template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="create">创建账号</el-button></template></el-dialog>
</template>
