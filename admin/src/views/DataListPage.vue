<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Search, Refresh, Download, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { adminApi } from '../services/admin-api'
import { exportCsv } from '../utils/export-csv'

const route = useRoute()
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const rows = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const orderType = ref(''); const statusFilter = ref(''); const dateRange = ref([]); const detail = ref(null)
const vehicleDialog = ref(false)
const vehicleForm = ref({ bikeNumber: '', batteryLevel: 100, status: 'available' })
const resource = computed(() => route.meta.resource)
const apiMap = { vehicles: 'vehicles', stations: 'stations', orders: 'orders', products: 'products', community: 'community', repairs: 'repairs' }
const config = computed(() => ({
  vehicles: { title: '车辆', description: '查看全部车辆的状态、电量、颜色和最后维护时间。', columns: [['bike_number', '车辆 ID'], ['model_name', '车型'], ['color_name', '颜色'], ['status', '状态'], ['battery_level', '电量'], ['total_mileage', '总里程']] },
  stations: { title: '停车点', description: '管理无锡停车点的服务范围与启用状态。', columns: [['zone_name', '停车点名称'], ['center_lat', '纬度'], ['center_lng', '经度'], ['radius', '服务半径'], ['status', '状态'], ['available_vehicles', '可用车辆']] },
  orders: { title: '订单', description: '统一查看骑行订单和商城购买订单。', columns: [['source', '来源'], ['order_number', '订单号'], ['user_name', '用户'], ['order_type', '订单类型'], ['status', '状态'], ['amount_cents', '金额']] },
  products: { title: '商品', description: '管理整车与配件商品的价格、积分价格和上架状态。', columns: [['name', '商品名称'], ['product_type', '类型'], ['price_cents', '现金价'], ['points_price', '积分价'], ['status', '状态']] },
  community: { title: '社区内容', description: '查看全部社区帖子，支持对违规内容进行隐藏或恢复发布。', columns: [['post_id', '帖子 ID'], ['nickname', '发布用户'], ['content', '内容'], ['like_count', '点赞'], ['comment_count', '评论'], ['status', '状态']] },
  repairs: { title: '报修工单', description: '查看用户提交的全部报修工单并更新处理状态。', columns: [['ticket_no', '工单号'], ['nickname', '用户'], ['vehicle_identifier', '车辆 ID'], ['issue_types_json', '故障类型'], ['status', '状态'], ['created_at', '提交时间']] }
}[resource.value] || { title: '管理页面', description: '', columns: [] }))

const fetchRows = async () => {
  loading.value = true; error.value = ''
  try {
    const range = dateRange.value || []
    const result = await adminApi[apiMap[resource.value]]({ page: page.value, pageSize, keyword: keyword.value || undefined, status: statusFilter.value || undefined, orderType: orderType.value || undefined, startDate: range[0] || undefined, endDate: range[1] || undefined })
    rows.value = result.items || []
    total.value = result.total || 0
  } catch (err) { error.value = err.message; rows.value = [] } finally { loading.value = false }
}
const filteredRows = computed(() => rows.value.filter((row) => (!statusFilter.value || row.status === statusFilter.value) && (!orderType.value || row.order_type === orderType.value)))
const exportColumns = computed(() => config.value.columns)
const download = () => exportCsv(`途能${config.value.title}列表.csv`, exportColumns.value, filteredRows.value)
const cellValue = (row, key) => {
  const value = row[key]
  if (key === 'price_cents' || key === 'amount_cents') return `¥ ${(Number(value || 0) / 100).toFixed(2)}`
  if (key === 'issue_types_json') { try { return Array.isArray(value) ? value.join('、') : JSON.parse(value || '[]').join('、') } catch { return value || '-' } }
  if (key === 'content') return String(value || '').slice(0, 42)
  if (key === 'status') return ({ pending_payment: '待支付', paid: '已支付', shipped: '待收货', completed: '已完成', cancelled: '已取消', after_sales: '售后中', available: '空闲', in_use: '使用中', maintenance: '维修中', offline: '已下线', submitted: '待处理', processing: '处理中', resolved: '已修复', closed: '已关闭', active: '正常', inactive: '已下架', published: '已发布', hidden: '已隐藏' }[value] || (Number(value) ? '启用' : '停用'))
  if (key === 'order_type') return ({ vehicle: '销售订单', accessory: '配件订单', rental: '租赁订单' }[value] || value)
  return value ?? '-'
}
const openVehicleDialog = () => { vehicleForm.value = { bikeNumber: `TN${String(Date.now()).slice(-3)}`, batteryLevel: 100, status: 'available' }; vehicleDialog.value = true }
const saveVehicle = async () => { try { await adminApi.createVehicle(vehicleForm.value); ElMessage.success('车辆已新增'); vehicleDialog.value = false; fetchRows() } catch (err) { ElMessage.error(err.message) } }
const updateStatus = async (row) => {
  try {
    if (resource.value === 'orders') {
      const next = row.status === 'pending_payment' ? 'cancelled' : row.status === 'paid' ? 'shipped' : row.status === 'shipped' ? 'completed' : 'after_sales'
      await adminApi.updateOrderStatus(row.source, row.order_id, next)
    }
    if (resource.value === 'vehicles') await adminApi.updateVehicle(row.vehicle_id, { status: row.status === 'maintenance' ? 'available' : 'maintenance' })
    if (resource.value === 'products') await adminApi.updateProduct(row.product_id, { status: row.status === 'active' ? 'inactive' : 'active' })
    if (resource.value === 'community') await adminApi.updatePost(row.post_id, { status: row.status === 'published' ? 'hidden' : 'published' })
    if (resource.value === 'repairs') await adminApi.updateRepair(row.ticket_id, { status: row.status === 'resolved' ? 'closed' : 'resolved' })
    if (resource.value === 'stations') await adminApi.updateStation(row.zone_id, { status: Number(row.status) ? 0 : 1 })
    ElMessage.success('状态已更新'); fetchRows()
  } catch (err) { ElMessage.error(err.message) }
}
const orderAction = (row) => ({ pending_payment: '取消订单', paid: '确认发货', shipped: '确认完成', completed: '售后标记', after_sales: '关闭售后', cancelled: '查看记录' }[row.status] || '处理')
watch([resource, orderType, statusFilter, dateRange], () => { page.value = 1; fetchRows() }, { deep: true })
onMounted(fetchRows)
</script>

<template>
  <section class="page-head"><div><h1>{{ config.title }}管理</h1><p>{{ config.description }}</p></div><div class="head-actions"><el-button v-if="resource === 'vehicles'" type="primary" @click="openVehicleDialog">新增车辆</el-button><el-button :icon="Download" @click="download">导出 Excel</el-button><el-button :icon="Refresh" :loading="loading" @click="fetchRows">刷新</el-button></div></section>
  <el-card shadow="never"><div class="table-toolbar"><div class="filter-row"><el-input v-model="keyword" :prefix-icon="Search" placeholder="关键词搜索" clearable @keyup.enter="page = 1; fetchRows()" /><el-select v-if="resource === 'orders'" v-model="orderType" placeholder="订单类型" clearable><el-option label="销售订单" value="vehicle" /><el-option label="租赁订单" value="rental" /><el-option label="配件订单" value="accessory" /></el-select><el-select v-if="resource === 'orders' || resource === 'repairs'" v-model="statusFilter" placeholder="状态" clearable><el-option v-for="item in (resource === 'orders' ? [{v:'pending_payment',l:'待支付'},{v:'paid',l:'已支付'},{v:'shipped',l:'待收货'},{v:'completed',l:'已完成'},{v:'cancelled',l:'已取消'},{v:'after_sales',l:'售后中'}] : [{v:'submitted',l:'待处理'},{v:'processing',l:'处理中'},{v:'resolved',l:'已修复'},{v:'closed',l:'已关闭'}])" :key="item.v" :label="item.l" :value="item.v" /></el-select><el-date-picker v-if="resource === 'orders' || resource === 'repairs'" v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" clearable /></div><span>共 {{ filteredRows.length }} / {{ total }} 条</span></div><el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="table-error" /><el-table :data="filteredRows" v-loading="loading" stripe><el-table-column v-for="([key, label]) in config.columns" :key="key" :prop="key" :label="label" min-width="130" show-overflow-tooltip><template #default="scope"><el-tag v-if="key === 'status'" size="small" :type="['active','available','published','resolved',1].includes(scope.row[key]) ? 'success' : ['maintenance','processing','pending','paid'].includes(scope.row[key]) ? 'warning' : 'info'">{{ cellValue(scope.row, key) }}</el-tag><template v-else>{{ cellValue(scope.row, key) }}</template></template></el-table-column><el-table-column label="操作" width="220" fixed="right"><template #default="scope"><el-button link type="primary" :icon="View" @click="detail = scope.row">详情</el-button><el-button link type="primary" @click="updateStatus(scope.row)">{{ resource === 'orders' ? orderAction(scope.row) : resource === 'products' ? (scope.row.status === 'active' ? '下架' : '上架') : resource === 'community' ? (scope.row.status === 'published' ? '隐藏' : '恢复') : resource === 'repairs' ? '推进工单' : resource === 'stations' ? (Number(scope.row.status) ? '停用' : '启用') : '切换维护' }}</el-button></template></el-table-column></el-table><div class="pagination"><el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="fetchRows" /></div></el-card>
  <el-drawer v-model="detail" :title="resource === 'orders' ? '订单详情' : resource === 'repairs' ? '工单详情' : '记录详情'" size="430px"><el-descriptions v-if="detail" :column="1" border><template v-if="resource === 'orders'"><el-descriptions-item label="订单号">{{ detail.order_number }}</el-descriptions-item><el-descriptions-item label="用户">{{ detail.user_name }}</el-descriptions-item><el-descriptions-item label="类型">{{ cellValue(detail, 'order_type') }}</el-descriptions-item><el-descriptions-item label="金额">{{ cellValue(detail, 'amount_cents') }}</el-descriptions-item><el-descriptions-item label="状态">{{ cellValue(detail, 'status') }}</el-descriptions-item><el-descriptions-item label="下单时间">{{ detail.created_at }}</el-descriptions-item><el-descriptions-item label="支付流水">{{ detail.payment_no || '待接入支付流水' }}</el-descriptions-item></template><template v-else-if="resource === 'repairs'"><el-descriptions-item label="工单编号">{{ detail.ticket_no }}</el-descriptions-item><el-descriptions-item label="报修用户">{{ detail.nickname }}</el-descriptions-item><el-descriptions-item label="车辆编号">{{ detail.vehicle_identifier }}</el-descriptions-item><el-descriptions-item label="故障类型">{{ cellValue(detail, 'issue_types_json') }}</el-descriptions-item><el-descriptions-item label="联系方式">{{ detail.contact_phone || '-' }}</el-descriptions-item><el-descriptions-item label="处理说明">{{ detail.resolution || '暂无' }}</el-descriptions-item><el-descriptions-item label="状态">{{ cellValue(detail, 'status') }}</el-descriptions-item></template><template v-else><el-descriptions-item v-for="([key, label]) in config.columns" :key="key" :label="label">{{ cellValue(detail, key) }}</el-descriptions-item></template></el-descriptions></el-drawer>
  <el-dialog v-model="vehicleDialog" title="新增车辆" width="420px"><el-form label-position="top"><el-form-item label="车辆编号"><el-input v-model="vehicleForm.bikeNumber" placeholder="例如 TN005" /></el-form-item><el-form-item label="初始电量"><el-input-number v-model="vehicleForm.batteryLevel" :min="0" :max="100" style="width: 100%" /></el-form-item><el-form-item label="初始状态"><el-select v-model="vehicleForm.status" style="width: 100%"><el-option label="空闲" value="available" /><el-option label="维修中" value="maintenance" /><el-option label="已下线" value="offline" /></el-select></el-form-item></el-form><template #footer><el-button @click="vehicleDialog = false">取消</el-button><el-button type="primary" @click="saveVehicle">保存车辆</el-button></template></el-dialog>
</template>
