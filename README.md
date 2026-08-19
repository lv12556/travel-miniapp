# T87D 绿色出行小程序

## 1. 项目简介

T87D 是一个面向太阳能助力车销售、共享租车、社区运营和低碳积分的微信小程序项目。项目包含 uni-app + Vue 3 前端、Express + TypeScript 后端，以及 MySQL 数据库脚本。

当前版本是可交互的产品原型和基础 API 版本，适合页面验收、产品演示和接口联调，不能直接视为已经上线的生产版本。

项目约定：

- 产品名称固定为 T87D，不使用 T87D Pro。
- 当前演示城市统一为无锡。
- 当前只有一个车型：T87D。
- 数据库整车价格为 499900 分，即 4999 元。
- 前端固定按手机屏幕比例展示，不做电脑横向布局。

## 2. 当前完成情况

### 已完成

- 首页：无锡定位、搜索入口、通知未读点、快捷服务、Banner 详情、热门整车自动轮播。
- 共享租车：演示地图、车辆点位、刷新、扫码演示、车辆 ID、骑行套餐、结束骑行结算页。
- 碳积分：碳资产、积分流水、骑行数据、徽章和积分兑换入口。
- 商城：T87D 颜色选择、整车购买、配件购买、地址填写、购买订单详情、积分兑换权益。
- 社区：帖子列表、发布帖子、帖子详情、点赞、评论、关注和收藏。收藏只针对帖子，不收藏商品。
- 我的：资料编辑、头像昵称保存、购买订单、骑行订单、我的车辆、碳积分钱包、我的收藏、地址、隐私和关于页面。
- 服务：在线报修、故障类型多选、车辆 ID、照片选择、报修记录、智能客服对话。
- 通用组件：加载中、失败、空数据、重试和分页组件基础。
- 状态管理：已经建立用户、车辆、订单、积分 Pinia store。
- 图片资源：已集中到 client/src/static，并按用途分类整理。
- 后端路由：认证、用户、停车点、车辆、骑行、积分、商城、权益、社区、通知、报修、客服和健康检查模块已建立。
- 数据库脚本：server/sql/schema.sql 已包含主要业务表和无锡演示种子数据。

### 未完成，不能直接上线

- 微信真实登录和 AppSecret 配置尚未完成。
- 微信定位、真实地图、附近车辆实时数据和导航尚未接入。
- 扫码开锁目前是演示流程，尚未连接真实车锁设备。
- 车辆锁状态、电量、定位和故障回传尚未接入设备平台。
- 微信支付预支付、支付回调验签、退款和对账尚未完成。
- 商品库存、SKU、售后和管理员后台尚未完成。
- 积分扣减、优惠券核销和兑换订单还需要生产级幂等与事务保护。
- 微信订阅消息或生产消息推送尚未接入。
- 数据库迁移、备份恢复、监控告警、日志审计、限流和自动化测试尚未完成。
- 隐私协议、用户协议、权限说明和微信审核资料需要准备。

结论：当前版本可以演示完整页面流程，但真实登录、真实车辆、真实支付和生产运维未完成前，不要发布正式版。

## 3. 项目结构

```text
travel-miniapp/
├── client/                         前端 uni-app + Vue 3
│   ├── src/
│   │   ├── App.vue                 全局容器、底部导航、全局样式
│   │   ├── main.js                 Vue、Pinia、Wot Design Uni 初始化
│   │   ├── pages.json              uni-app 页面配置
│   │   ├── pages/home/index.vue    首页入口
│   │   ├── components/TunengApp.vue 主状态容器和业务交互编排
│   │   ├── components/common/      异步状态和分页组件
│   │   ├── components/pages/       首页、租车、碳积分、商城、社区、我的
│   │   ├── context/                页面共享上下文
│   │   ├── data/tuneng.js          演示数据、车型、商品和 Banner 配置
│   │   ├── services/               请求和认证封装
│   │   ├── stores/                 用户、车辆、订单、积分 Pinia store
│   │   └── static/                 全部图片资源
│   ├── manifest.json               AppID 和平台配置
│   ├── vite.config.js              Vite/uni-app 构建配置
│   └── package.json                前端依赖和命令
├── server/                         后端 Express + TypeScript
│   ├── src/app.ts                  Express 应用、中间件、路由和错误处理
│   ├── src/index.ts                后端启动入口
│   ├── src/config/                 环境变量和数据库配置
│   ├── src/common/                 鉴权、错误、统一响应和工具
│   ├── src/routes/api.router.ts    API 路由汇总
│   ├── src/modules/                各业务模块路由和服务
│   ├── sql/schema.sql              MySQL 表结构和无锡演示数据
│   ├── API.md                      接口说明
│   ├── .env.example                环境变量模板
│   └── package.json                后端依赖和命令
├── PROJECT_STRUCTURE.md            文件职责详细说明
├── README.md                       当前项目交接文档
└── .gitignore                      Git 忽略规则
```

前端图片目录：

```text
client/src/static/
├── products/vehicles/              T87D 整车图和颜色卡片
├── products/accessories/           头盔、防水包、智能车锁、补能灯
├── icons/                          导航、通知、扫码、车辆点位等图标
├── banners/                        首页背景、活动 Banner、活动海报
├── community/                      社区帖子配图
├── badges/                         骑行和碳积分徽章
├── metrics/                        里程、减碳、积分指标图
└── profile/                        订单路线和个人中心图片
```

不要恢复旧的 static/bikes、static/accessories 目录，也不要手动修改 client/dist 或 server/dist，它们都是可以重新生成的构建产物。

## 4. 技术栈

- 前端：uni-app、Vue 3、Vite、Pinia、Wot Design Uni、Sass。
- 后端：Node.js、Express 5、TypeScript、Zod、JWT、mysql2。
- 数据库：MySQL 8，字符集 utf8mb4。
- 平台：微信小程序；H5 只用于浏览器预览和开发调试。

## 5. 本地运行

### 5.1 前端 H5

在 CMD 执行：

    cd /d C:\Users\Administrator\Documents\Codex\2026-08-17\new-chat\travel-miniapp\client
    npm install
    npm run dev:h5

浏览器打开终端显示的地址，通常是 http://localhost:5173/。H5 不能获取微信登录 code，也不能代替真机验证定位、扫码和支付。

### 5.2 微信小程序

    cd /d C:\Users\Administrator\Documents\Codex\2026-08-17\new-chat\travel-miniapp\client
    npm install
    npm run dev:mp-weixin

在微信开发者工具导入：

    C:\Users\Administrator\Documents\Codex\2026-08-17\new-chat\travel-miniapp\client\dist\dev\mp-weixin

正式构建命令：npm run build:mp-weixin。不要手动修改 dist 目录。

### 5.3 初始化数据库

确保 MySQL 8 已启动，然后执行：

    mysql -u root -p < C:\Users\Administrator\Documents\Codex\2026-08-17\new-chat\travel-miniapp\server\sql\schema.sql

脚本会创建 tuneng_db，写入 T87D 车型、颜色、无锡停车点、演示车辆、商品和优惠权益。重复执行前请确认是否需要保留业务数据。

### 5.4 启动后端

    cd /d C:\Users\Administrator\Documents\Codex\2026-08-17\new-chat\travel-miniapp\server
    copy .env.example .env
    npm install
    npm run dev

健康检查地址：http://localhost:3000/api/v1/health。生产构建使用 npm run typecheck、npm run build，生产启动使用 npm start。

### 5.5 配置前端 API 地址

在 client/.env.development 中设置：

    VITE_API_BASE_URL=http://127.0.0.1:3000/api/v1

真机调试时，将 127.0.0.1 换成电脑局域网 IP，并放行 3000 端口。微信正式版必须使用 HTTPS 合法域名。

## 6. 环境变量和安全要求

server/.env 至少需要：

    PORT=3000
    CORS_ORIGIN=*
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_NAME=tuneng_db
    DB_USER=root
    DB_PASSWORD=本地数据库密码
    JWT_SECRET=长度至少32位的随机字符串
    WECHAT_APPID=小程序AppID
    WECHAT_APPSECRET=小程序AppSecret
    ALLOW_DEMO_LOGIN=true
    RENTAL_START_FEE_CENTS=100
    RENTAL_FEE_PER_MINUTE_CENTS=30

本地演示可以使用 ALLOW_DEMO_LOGIN=true。上线前必须改为 false。AppSecret、数据库密码、JWT 密钥、微信支付商户密钥不能提交 Git。生产环境应使用 CORS 白名单和最小数据库权限。

## 7. 后端模块和数据库

后端 API 统一使用 /api/v1 前缀，详细接口见 server/API.md。

| 模块 | 主要内容 |
| --- | --- |
| auth | 微信登录、演示登录、JWT 会话 |
| users | 用户资料和当前用户信息 |
| stations | 无锡停车点 |
| vehicles | 附近车辆、车辆详情、开锁接口骨架 |
| trips | 开始骑行、轨迹、结束骑行、历史订单 |
| points | 积分余额和流水 |
| commerce | 商品、地址、购买订单、支付记录基础 |
| benefits | 优惠券和权益基础 |
| engagement | 社区、评论、点赞、收藏、报修、客服基础 |
| notifications | 通知列表、未读数量、已读状态 |
| health | 服务健康检查 |

数据库脚本包含 users、vehicle_models、colors、vehicles、parking_zones、rental_orders、points_transactions、vehicle_location_history、trip_tracks、user_addresses、products、commerce_orders、commerce_order_items、order_payments、coupons、user_coupons、community_posts、community_comments、community_post_reactions、notifications、repair_tickets、support_messages 等表。

生产环境还需要数据库迁移版本、索引复核、备份恢复、权限控制和审计策略。

## 8. 前后端打通顺序

1. 配置 server/.env 和 MySQL，确认 health 接口正常。
2. 客户端配置 VITE_API_BASE_URL，确认请求层可以访问后端。
3. 实现微信登录，客户端保存 JWT，所有受保护请求携带 Authorization。
4. 将 TunengApp.vue 中的演示用户、车辆、订单、积分和商城数据逐步替换为 API 响应。
5. 将页面状态继续收口到 Pinia，统一处理加载、错误、空数据、重试和登录过期。
6. 对开锁、结束骑行、订单支付、积分扣减和优惠券核销增加事务、幂等键和权限校验。

## 9. 正式上线步骤

### 9.1 平台和账号

1. 在微信公众平台确认小程序主体、AppID、AppSecret 和类目资质。
2. 准备隐私协议、用户协议、定位和相机权限说明、客服信息。
3. 配置 request、upload、download、socket 合法域名，全部使用 HTTPS。
4. 实现 jscode2session，关闭演示登录，完成 token 过期和退出登录处理。

### 9.2 地图、定位和车辆

1. 接入 uni.getLocation，处理首次授权、拒绝和重新授权。
2. 接入腾讯地图或其他地图服务，替换视觉演示地图。
3. 接入真实车辆和停车点 API，按距离、电量、状态展示附近车辆。
4. 扫码解析真实车辆 ID，后端校验车辆状态和用户权限。
5. 接入车锁平台的开锁、锁状态、电量、定位和故障回传。
6. 开锁、结束骑行和费用结算必须使用事务、幂等和审计日志。

### 9.3 商城、积分和支付

1. 补充库存、SKU、订单状态机、售后和管理员操作接口。
2. 服务端创建微信支付预支付订单，客户端不保存任何支付密钥。
3. 实现支付回调验签、重复回调幂等、退款和订单同步。
4. 积分兑换在事务中扣减积分并生成权益或兑换订单。
5. 优惠券核销校验城市、有效期、首骑条件、不可叠加规则和订单归属。

### 9.4 测试、部署和审核

1. 为认证、车辆、骑行、订单、积分和支付回调补单元测试和接口测试。
2. 部署 HTTPS API、MySQL、日志、监控、告警、备份和恢复演练。
3. 真机测试弱网、登录过期、定位拒绝、扫码失败、开锁超时、支付失败和重复点击。
4. 使用微信开发者工具构建体验版，灰度测试后提交正式审核。
5. 审核通过后逐步放量，持续观察错误率、订单状态和支付对账。

## 10. 上线阻断条件

以下任一项未完成，都不要发布正式版：

- 真实微信登录和 HTTPS 合法域名。
- 真实车辆状态、扫码和开锁闭环。
- 微信支付回调验签、退款和对账。
- 数据库备份、恢复和生产权限控制。
- 隐私协议、用户协议和权限合规。
- 真机异常场景和重复操作测试。

## 11. 给后续 AI 的接手约定

- 先阅读本 README 和 PROJECT_STRUCTURE.md，再修改代码。
- 优先修改 client/src 和 server/src，不要手改 client/dist、server/dist 或临时缓存。
- 新图片放入 client/src/static 对应分类，引用统一使用 /static/ 路径。
- 保持单一车型 T87D 和无锡演示城市，除非用户明确要求修改。
- 后端新增接口同步补请求校验、鉴权、统一响应和 server/API.md。
- 涉及车辆状态、订单金额、积分扣减和支付回调的写操作必须使用事务和幂等设计。
- 所有密钥和密码只放环境变量，不写入源码和 README。

## 12. 常用命令

前端 H5：cd client，然后 npm run dev:h5 或 npm run build:h5。

微信小程序：cd client，然后 npm run dev:mp-weixin 或 npm run build:mp-weixin。

后端：cd server，然后 npm run dev、npm run typecheck、npm run build 或 npm start。

## 13. 发布检查清单

- [ ] 真实微信登录已完成，ALLOW_DEMO_LOGIN=false。
- [ ] API 已部署 HTTPS，合法域名已配置。
- [ ] 无锡真实地图、定位和车辆数据已接入。
- [ ] 扫码、开锁、结束骑行和费用结算已真机验证。
- [ ] 商品库存、支付、退款、积分和优惠券已联调。
- [ ] 隐私协议、用户协议和权限说明已准备。
- [ ] 数据库备份、日志、监控和告警已启用。
- [ ] 弱网、异常、重复点击和登录过期场景已测试。
- [ ] 微信体验版审核通过并完成灰度回归。
