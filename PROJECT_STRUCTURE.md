# Tuneng Project Structure

## Root

```text
travel-miniapp/
├── client/                 uni-app + Vue 3 前端
├── admin/                  Vue 3 + Vite 网页运营管理台（管理员登录和 RBAC）
├── server/                 Express + TypeScript 后端
├── README.md               项目总说明、启动方式和发布注意事项
└── PROJECT_STRUCTURE.md    当前目录和代码职责说明
```

`node_modules`、`client/dist`、`server/dist` 和浏览器检查缓存不属于源码。构建产物和缓存已清理，后续可通过 npm 命令重新生成。

## Admin

```text
admin/
├── src/
│   ├── layouts/AdminLayout.vue    左侧导航、顶部栏和后台整体布局
│   ├── router/index.js            登录、运营概览、用户、车辆、订单、商家、售后等路由
│   ├── services/http.js           Axios 实例、Token 注入、统一错误处理
│   ├── services/admin-api.js      复用 server /api/v1 的接口封装
│   ├── stores/app.js              Pinia 全局界面和概览状态
│   ├── views/DashboardPage.vue    4 个 KPI、订单趋势、车辆分布和待办入口
│   ├── views/UsersPage.vue        用户搜索、详情、冻结/解冻和导出
│   ├── views/MerchantsPage.vue    商家筛选、入驻审核、编辑和冻结/解冻
│   ├── views/DataListPage.vue     车辆、停车点、订单、商品、社区、售后通用列表和分页操作
│   ├── views/SettingsPage.vue     API、数据库和权限配置说明
│   └── styles/main.css            保持现有绿色调的管理台样式
├── .env.example                   统一后端 API 地址模板
├── package.json                   Vue 3、Vite、Element Plus、Pinia、Axios 依赖
└── README.md                      管理台说明、限制和启动方式
```

管理台不创建第二套数据库，`VITE_API_BASE_URL` 默认指向 `server` 的 `/api/v1`。管理员从 `server/.env` 的 bootstrap 配置首次创建，登录后使用独立 JWT；`/api/v1/admin/*` 由 `requireAdmin` 保护，普通小程序用户 Token 无法访问。后台与小程序始终读取同一套 MySQL 数据。

## Client

```text
client/
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── pages.json
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── stores/
│   └── static/
├── package.json
├── vite.config.js
├── manifest.json
└── README.md
```

### Client code

| File or directory | Responsibility |
|---|---|
| `src/App.vue` | 应用根组件、全局安全区和基础样式入口 |
| `src/main.js` | Vue、Pinia、Wot Design Uni 初始化入口 |
| `src/pages.json` | uni-app 页面和组件配置 |
| `src/pages/home/index.vue` | 挂载途能主应用的唯一页面入口 |
| `src/components/TunengApp.vue` | 主状态容器；负责页面切换、详情页、购买、社区、报修、通知和扫码逻辑 |
| `src/components/pages/HomePage.vue` | 首页：定位、搜索、通知、Banner、快捷服务 |
| `src/components/pages/RentalPage.vue` | 共享租车、车辆地图、骑行套餐 |
| `src/components/pages/CarbonPage.vue` | 碳资产、积分、骑行记录和徽章 |
| `src/components/pages/ShopPage.vue` | 整车、配件和积分商城 |
| `src/components/pages/CommunityPage.vue` | 社区帖子、点赞、评论、收藏和发布入口 |
| `src/components/pages/ProfilePage.vue` | 我的页面、订单、车辆、收藏、地址和设置入口 |
| `src/components/common/AsyncState.vue` | 加载中、失败、重试和空数据状态 |
| `src/components/common/PaginationFooter.vue` | 分页和加载更多状态 |
| `src/context/tuneng-context.js` | 页面组件访问主应用状态的上下文键 |
| `src/data/tuneng.js` | 首页文案、车型配色、Banner、套餐、徽章和静态演示数据 |
| `src/services/request.js` | 统一 API 请求、JWT 注入、错误转换和自动重试 |
| `src/services/auth.js` | 微信登录、Token 存储、当前用户缓存和退出登录 |
| `src/stores/user.js` | 用户资料、登录状态、登录过期和积分变更 |
| `src/stores/vehicles.js` | 附近车辆、停车点和车辆加载状态 |
| `src/stores/orders.js` | 骑行历史、购买订单和分页状态 |
| `src/stores/points.js` | 积分余额、积分流水和兑换状态 |

### Client resources

所有图片都在 `client/src/static` 下，代码中统一使用 `/static/...` 引用。

| Directory | Content |
|---|---|
| `static/products/vehicles` | T87D 四种颜色的整车图和订单卡片图 |
| `static/products/accessories` | 头盔、防水骑行包、智能车锁、补能灯 |
| `static/icons` | 导航、扫码、搜索、通知、车辆点位和快捷服务图标 |
| `static/banners` | 首页 Banner、绿色骑行季活动海报和首页背景 |
| `static/community` | 社区帖子配图 |
| `static/badges` | 碳积分和骑行成就徽章 |
| `static/metrics` | 碳积分、里程和积分指标图 |
| `static/profile` | 个人中心、订单路线和服务入口图片 |

## Server

```text
server/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── config/
│   ├── common/
│   ├── modules/
│   └── routes/
├── sql/schema.sql
├── API.md
├── package.json
├── tsconfig.json
└── .env.example
```

### Server code

| File or directory | Responsibility |
|---|---|
| `src/app.ts` | Express 应用、CORS、JSON、API 路由和错误处理中间件 |
| `src/index.ts` | 启动 HTTP 服务 |
| `src/config/env.ts` | 环境变量校验和运行配置 |
| `src/config/database.ts` | MySQL 连接池、查询和事务封装 |
| `src/common/errors` | 业务错误类型 |
| `src/common/http` | 统一成功响应格式 |
| `src/common/middleware/auth.ts` | JWT 签发和用户鉴权 |
| `src/common/middleware/error-handler.ts` | Zod、业务错误和未知错误处理 |
| `src/common/utils` | 异步路由包装器 |
| `src/routes/api.router.ts` | 汇总所有 `/api/v1` 模块路由 |
| `src/modules/auth` | 微信登录、演示登录和 Token 刷新 |
| `src/modules/users` | 用户资料查询和编辑 |
| `src/modules/vehicles` | 附近车辆、车辆详情和开锁 |
| `src/modules/stations` | 无锡停车点和可用车辆数量 |
| `src/modules/trips` | 开始骑行、轨迹、结束骑行和历史订单 |
| `src/modules/points` | 积分余额和积分流水 |
| `src/modules/commerce` | 商品、地址、购买订单和支付记录 |
| `src/modules/benefits` | 优惠券领取、权益查询和核销 |
| `src/modules/engagement` | 社区、评论、点赞、收藏、报修和客服 |
| `src/modules/notifications` | 通知列表、未读数量和已读状态 |
| `src/modules/health` | 服务和数据库健康检查 |
| `src/modules/admin` | 管理员账号初始化、scrypt 密码校验、RBAC 和全量管理接口 |
| `sql/schema.sql` | 数据库建表、无锡演示车辆、停车点、商品和权益种子数据 |
| `API.md` | API 方法、路径和请求说明 |

## Database

数据库脚本当前保留单一 T87D 车型，但保留 `vehicle_models` 表用于车辆关系和后续扩展；不再使用车型素材表，车辆图片由前端静态资源目录管理。

运行服务端检查：

```cmd
cd /d C:\Users\Administrator\Documents\Codex\2026-08-17\new-chat\travel-miniapp\server
npm run typecheck
npm run build
```
