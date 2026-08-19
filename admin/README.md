# 途能运营管理台

这是与 `client/` 小程序共用同一个 `server/` 后端 API 和 `tuneng_db` 数据库的网页管理端。技术栈：Vue 3、Vite、Element Plus、Pinia、Axios、Vue Router。

## 管理员怎么加

当前为了在数据库接入前查看页面，开发环境已开启演示登录：账号 `12345`，密码 `00000000`。这是前端本地演示凭据，不会写入数据库，也不会被生产构建启用。

1. 先执行一次 `server/sql/schema.sql`，确保存在 `admins` 和 `admin_action_logs` 表。
2. 复制 `server/.env.example` 为 `server/.env`，设置管理员账号和强密码：

```env
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=请替换为至少10位强密码
```

3. 启动后端。服务第一次启动时，如果 `admins` 表中没有这个账号，会用 `scrypt` 哈希自动创建 `super_admin`；账号已存在时不会覆盖密码。
4. 打开管理台 `http://localhost:5174/login` 登录。管理员 Token 有效期为 8 小时，普通小程序用户 Token 无法访问 `/api/v1/admin/*`。
5. 首次创建成功后，可从 `server/.env` 删除 `ADMIN_BOOTSTRAP_PASSWORD`，避免长期保留初始密码。忘记密码时应在受控运维流程中重置 `admins.password_hash`，不要把明文密码写入 SQL 或代码。

角色目前有两种：`super_admin` 可以执行全部管理操作，`editor` 可以编辑车辆状态、停车点、商品、社区内容和报修状态。

数据库接入后，把 `admin/.env.development` 的 `VITE_ADMIN_DEMO_LOGIN` 改为 `false`，再使用服务端 `.env` 创建的真实管理员账号。

## 已完成

- 管理台布局、导航和运营概览，保持现有绿色视觉和桌面端布局。
- 登录页：管理员账号、密码、记住账号、忘记密码提示；开发环境可用 `12345 / 00000000` 演示登录。
- 首页数据看板：4 个 KPI、近 7 日订单趋势、车辆状态分布、停车点可用车辆排行、运营摘要和 3 个待办快捷入口。
- 用户管理：昵称/手机号搜索、分页、头像列表、详情抽屉、冻结/解冻和 CSV（Excel 可打开）导出。
- 车辆管理：车辆编号搜索、状态维护切换、分页、详情、新增车辆演示表单和 CSV 导出。
- 订单管理：销售/配件/租赁类型切换、状态筛选、日期范围筛选、订单详情、取消/发货/完成/售后操作和 CSV 导出。
- 商家管理：经销商/景区/高校筛选、入驻审核、详情、编辑、冻结/解冻。
- 售后工单：状态和日期筛选、详情、处理进度推进、关闭和 CSV 导出。
- 社区、停车点、商品管理继续保留，作为运营人员的补充资源管理页。
- Axios 统一请求层，API 地址通过 `VITE_API_BASE_URL` 配置。
- 已建立管理员登录、独立 JWT、角色校验和退出登录。
- 已接入车辆、停车点、订单、商品、社区、报修的全量管理 API 和状态操作。
- 已加入超级管理员专用的管理员账号列表、新增和启停页面。

## 当前限制

后台已有基础 RBAC、全量列表和状态操作接口。演示模式的数据在浏览器内存中回写，刷新页面会恢复初始演示数据；真实环境需要 MySQL 接口。商品库存、真实发货/退款、细粒度操作日志展示和复杂审核策略仍需继续补充。

## 运行

```cmd
cd /d C:\Users\Administrator\Documents\Codex\2026-08-17\new-chat\travel-miniapp\admin
copy .env.example .env.development
npm install
npm run dev
```

默认打开 `http://localhost:5174`。运行后台前先启动 `server`，并确保 MySQL 已初始化。
