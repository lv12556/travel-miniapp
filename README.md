# T87D 绿色出行小程序

T87D 是一个面向太阳能助力车销售、共享租赁和低碳积分运营的微信小程序工程。仓库同时包含 uni-app 客户端与 Node.js API 服务端，当前以可交互的产品原型为主，并已具备 MySQL 数据模型、JWT 会话、车辆、站点、订单及积分接口基础。

> 产品名称固定为 `T87D`，不要在代码、文案或发布资料中使用 “T87D Pro”。

## 当前状态

| 范围 | 当前状态 | 说明 |
| --- | --- | --- |
| 小程序界面 | 可运行 | 首页、共享租赁、碳资产、商城、社区、个人中心及多个详情面板已实现。 |
| 页面交互 | 原型可用 | 车辆轮播、套餐切换、积分兑换、收藏、报修、客服对话、订单/骑行详情等在本地状态下可演示。 |
| 微信小程序构建 | 可运行 | 使用 `npm run dev:mp-weixin` 输出到 `client/dist/dev/mp-weixin`。 |
| 图标与图片 | 已本地化 | 车辆图片位于 `client/src/static/bikes`；微信端可用 PNG 图标位于 `client/src/static/icons`。 |
| 后端 API | 基础完成 | 已有认证、用户、站点、车辆、骑行、积分、健康检查等模块及 MySQL 访问。 |
| 微信真实登录 | 待配置密钥和联调 | AppID 已写入客户端；仍需在服务端填 AppSecret、配置合法域名并完成真机联调。 |
| 真实地图/定位 | 待接入 | 当前租赁地图为视觉原型；需接腾讯位置服务、微信定位和附近车辆 API。 |
| 支付、设备开锁、消息推送 | 待实现 | 当前只保留交互入口或演示反馈，不能直接用于生产。 |

## 仓库结构

```text
travel-miniapp/
├── client/                         # uni-app 前端（H5 + 微信小程序）
│   ├── src/
│   │   ├── components/TunengApp.vue # 主要交互界面和页面内状态
│   │   ├── pages/                   # uni-app 页面入口
│   │   ├── data/tuneng.js           # 前端展示数据、车辆和商城素材配置
│   │   ├── services/                # API 请求、认证和车辆服务
│   │   ├── static/bikes/            # 车辆与配件图片
│   │   ├── static/icons/            # 微信端本地图标 PNG
│   │   ├── App.vue                  # 全局样式、底部导航和安全区布局
│   │   ├── manifest.json            # uni-app / 微信小程序 AppID 配置
│   │   └── pages.json               # 页面与 Wot Design Uni 自动组件配置
│   ├── .env.development             # 本地 API 地址（不提交私密配置）
│   └── package.json
├── server/                          # Express + TypeScript API
│   ├── src/config/                  # 环境变量、数据库连接池
│   ├── src/common/                  # 鉴权、中间件、错误和统一响应
│   ├── src/modules/                 # auth / users / vehicles / stations / trips / points
│   ├── src/routes/api.router.ts     # API v1 路由汇总
│   ├── sql/schema.sql               # MySQL 建表与初始数据
│   ├── API.md                       # 接口清单
│   └── .env.example                 # 服务端环境变量模板
├── .gitignore
└── README.md
```

## 技术栈

### 客户端

- `uni-app` + `Vue 3`：同时输出 H5 和微信小程序。
- `Vite 5`：本地开发和构建。
- `Wot Design Uni`：按钮、提示、弹窗等跨端基础组件。
- `Sass`：全局界面样式。
- 本地图标 PNG：微信小程序端不依赖运行时 SVG，避免图标丢失。
- `Pinia` 已安装，当前界面状态仍主要在 `TunengApp.vue` 中；后续接真实 API 时建议将用户、订单、车辆状态迁入 store。

### 服务端

- Node.js + Express 5 + TypeScript。
- MySQL + `mysql2` 连接池和事务。
- Zod：请求参数校验。
- JWT：登录会话与受保护接口认证。
- `tsx`：开发期监听运行；`tsc`：生产构建。

### 外部平台

- 微信小程序：AppID 为 `wx1d95034f38451dfc`。
- 微信登录：需在服务端用 `jscode2session` 换取 `openid`。
- 腾讯位置服务：建议用于地图、逆地理编码和路线能力；尚未接入密钥。

## 快速启动

### 1. 前端 H5 预览

```bat
cd /d C:\Users\Administrator\Documents\Codex\travel-miniapp\client
npm install
npm run dev:h5
```

浏览器打开终端显示的地址，通常是 `http://localhost:5173/`。

### 2. 微信小程序预览

```bat
cd /d C:\Users\Administrator\Documents\Codex\travel-miniapp\client
npm install
npm run dev:mp-weixin
```

保持该终端运行，然后在微信开发者工具中导入：

```text
C:\Users\Administrator\Documents\Codex\travel-miniapp\client\dist\dev\mp-weixin
```

导入后点击“编译”。每次修改 `client/src` 后，开发服务会重新生成该目录。

若开发者工具没有刷新样式或图片，使用“工具 -> 清除缓存 -> 清除全部缓存”，再点击“编译”。不要手改 `dist` 目录，它是构建产物。

### 3. 后端与数据库

1. 在 MySQL 中创建数据库并执行 `server/sql/schema.sql`。
2. 复制服务端配置：

```bat
cd /d C:\Users\Administrator\Documents\Codex\travel-miniapp\server
copy .env.example .env
```

3. 修改 `.env` 中的数据库账户、JWT 密钥和微信配置。
4. 安装并启动：

```bat
npm install
npm run dev
```

健康检查：`http://localhost:3000/api/v1/health`

### 4. 客户端连接本地 API

开发阶段在 `client/.env.development` 配置：

```ini
VITE_API_BASE_URL=http://127.0.0.1:3000/api/v1
```

真机调试不能访问手机自身的 `127.0.0.1`。将该地址换为电脑局域网 IP，例如 `http://192.168.1.10:3000/api/v1`，并确保防火墙放行端口 `3000`。微信正式版必须使用 HTTPS 合法域名。

## 环境变量

服务端 `server/.env` 的关键变量：

```ini
PORT=3000
CORS_ORIGIN=*
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=tuneng_db
DB_USER=root
DB_PASSWORD=replace_me
JWT_SECRET=replace_with_a_long_random_value
WECHAT_APPID=wx1d95034f38451dfc
WECHAT_APPSECRET=replace_me
ALLOW_DEMO_LOGIN=false
RENTAL_START_FEE_CENTS=100
RENTAL_FEE_PER_MINUTE_CENTS=20
```

不要提交 `.env`、AppSecret、数据库密码、JWT 生产密钥或任何微信支付密钥。

## 已有功能与 API

所有 API 以 `/api/v1` 为前缀，详情见 [server/API.md](server/API.md)。

| 模块 | 主要能力 |
| --- | --- |
| `auth` | 小程序登录、演示登录、JWT 刷新。 |
| `users` | 当前用户资料、积分和会员信息。 |
| `stations` | 停车区与可用车辆数量查询。 |
| `vehicles` | 附近车辆、车型素材、车辆详情、开锁。 |
| `trips` | 开始骑行、轨迹写入、结束骑行、骑行历史。 |
| `points` | 碳积分余额、等级和积分流水。 |

数据库使用 `users`、`vehicles`、`vehicle_models`、`colors`、`parking_zones`、`rental_orders`、`points_transactions`、`vehicle_location_history`、`trip_tracks`、`vehicle_model_assets` 等表。开锁、结束骑行、费用结算与积分发放应继续保持在同一事务中。

## 微信登录接入清单

1. 微信公众平台配置小程序 AppID、AppSecret 和 request 合法域名。
2. 确认 `client/src/manifest.json` 与 `client/manifest.json` 的 AppID 均为当前小程序 AppID。
3. 在 `server/.env` 填写 `WECHAT_APPID`、`WECHAT_APPSECRET` 和强随机 `JWT_SECRET`。
4. 客户端调用 `uni.login({ provider: 'weixin' })` 得到临时 `code`。
5. 后端调用微信 `jscode2session`，以 `openid` 创建/更新用户并签发 JWT。
6. 小程序前端保存 token，后续请求带 `Authorization: Bearer <token>`。
7. 真机验证未登录、首次登录、token 过期、退出登录和网络失败提示。

H5 环境无法获取微信小程序登录 `code`，这是平台限制。没有完成微信密钥配置时，只能使用 `ALLOW_DEMO_LOGIN=true` 的演示登录；上线前必须关闭。

## 后续开发计划

按下面顺序推进，能避免先做视觉、后补业务导致大面积返工。

### 阶段 1：接口联调与状态收口

- 将 `TunengApp.vue` 中的演示用户、订单、积分、车辆和商城数据逐步替换为 API 响应。
- 引入 Pinia store：至少拆分 `auth`、`vehicle`、`trip`、`points` 四个 store。
- 为请求层补充 token 注入、401 自动退出、加载态、错误提示与重试策略。
- 明确每个页面的数据来源，删除不再使用的 fallback 数据。

### 阶段 2：真实地图、定位和找车

- 在腾讯位置服务创建小程序 key，配置 WebService API 和安全域名。
- 用 `uni.getLocation` 获取用户定位并处理拒绝授权。
- 接入真实地图组件，在地图上渲染停车点、车辆状态和用户位置。
- 调用 `/vehicles/nearby` 与 `/stations`，实现附近车辆列表、距离排序、车辆详情和导航。

### 阶段 3：租车闭环与设备能力

- 扫码解析车辆编号，校验车辆状态。
- 设备侧接入开锁指令、锁状态回传、电量和定位上报；不要用前端模拟成功替代设备确认。
- 完善进行中订单、临时锁车、结束骑行、费用预估和异常订单处理。
- 对开锁、结束骑行接口加幂等键、权限校验和审计日志。

### 阶段 4：商城、积分和支付

- 建立商品、库存、购物车、订单、收货地址和售后数据模型。
- 对接微信支付，服务端创建预支付订单并处理支付回调验签。
- 积分兑换必须使用事务扣减积分、生成兑换订单并防止重复提交。
- 后台核销优惠券、兑换商品和会员权益。

### 阶段 5：质量、发布和运维

- 为服务端补单元测试、接口测试和数据库迁移策略。
- 完成隐私协议、用户协议、定位/相机权限说明和微信审核物料。
- 部署 HTTPS API、MySQL 备份、日志、监控、告警和错误追踪。
- 在微信公众平台配置合法域名，上传体验版，真机回归后提交审核。

## 给下一位开发者或 AI 的工作约定

- 优先修改 `client/src` 和 `server/src`，不要改 `client/dist` 或 `client/unpackage`，它们都是构建产物。
- 新增图标使用 `client/src/static/icons` 内的 PNG 或明确的微信小程序兼容图片，不要直接把 Vue SVG 组件作为小程序图标依赖。
- 保持 T87D 的绿色/白色视觉体系，避免引入蓝色主题；底部导航为自定义导航，不要重新启用原生 `tabBar`。
- 不要把 AppSecret、支付商户密钥、生产数据库密码提交到 Git。
- 后端新增接口先补 Zod schema、鉴权要求、统一响应和 `server/API.md` 文档。
- 任何涉及车辆状态、订单费用、积分扣减和支付回调的写操作必须使用事务并设计幂等性。

## 常用命令

```bat
:: 前端 H5
cd client
npm run dev:h5

:: 前端微信小程序构建
npm run dev:mp-weixin
npm run build:mp-weixin

:: 后端开发、检查和生产构建
cd server
npm run dev
npm run typecheck
npm run build
npm start
```

## 发布前检查

- [ ] 真实微信登录、定位、扫码、开锁、订单、积分和支付均已真机验证。
- [ ] `ALLOW_DEMO_LOGIN=false`，生产密钥和数据库账户已替换。
- [ ] API 使用 HTTPS，并已配置微信 request/upload/download/socket 合法域名。
- [ ] 隐私协议、用户协议、权限申请说明和客服入口完整。
- [ ] 小程序分包、首屏性能、异常网络和弱网状态已测试。
- [ ] 数据库备份、操作日志、错误报警和回滚方案可用。
