<script setup>
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1'
</script>

<template>
  <section class="page-head"><div><h1>系统设置</h1><p>统一管理台与小程序的接口环境。</p></div></section>
  <el-card shadow="never" class="settings-card"><el-descriptions :column="1" border><el-descriptions-item label="管理台项目">admin/（Vue 3 + Vite）</el-descriptions-item><el-descriptions-item label="统一 API 地址">{{ apiBaseUrl }}</el-descriptions-item><el-descriptions-item label="统一数据库">server/sql/schema.sql 创建的 tuneng_db</el-descriptions-item><el-descriptions-item label="当前权限模型"><el-tag type="success">RBAC 已启用：super_admin / editor</el-tag></el-descriptions-item><el-descriptions-item label="演示账号">开发环境：12345 / 00000000</el-descriptions-item></el-descriptions><el-divider /><el-alert title="当前管理台已覆盖用户、车辆、订单、商家和售后工单的核心运营闭环。正式上线前仍需关闭演示登录，配置 HTTPS、真实支付、操作日志展示、备份和监控。" type="info" :closable="false" show-icon /></el-card>
</template>
