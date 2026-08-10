# 途能共享太阳能助力车平台

本项目是“途能共享太阳能助力车”小程序的初始工程，包含 uni-app 前端和 Node.js 后端。前端可用于 H5 与微信小程序构建；后端采用 Express + TypeScript，已提供 MySQL 数据访问基础、统一接口规范和业务模块路由。

## 项目结构

```text
travel-miniapp/
├── client/                 # uni-app + Vue 3 前端
│   ├── src/pages/          # 小程序页面
│   ├── src/services/       # 后端接口请求封装
│   └── manifest.json       # uni-app 应用配置
└── server/                 # Express + TypeScript 后端
    ├── src/config/         # 环境变量与 MySQL 连接池
    ├── src/common/         # 响应、错误和中间件
    ├── src/modules/        # 认证、用户、站点、车辆、骑行订单模块
    ├── src/routes/         # API 路由汇总
    ├── sql/                # 数据库建表脚本
    └── API.md              # API 接口清单
```

## 技术栈

- 前端：uni-app、Vue 3、Vite
- 后端：Node.js、Express 5、TypeScript
- 数据库：MySQL 5.7+ / 8.0+、mysql2
- 参数校验：Zod

## 前端启动

进入前端目录并安装依赖：

```bash
cd client
npm install
```

启动 H5 调试：

```bash
npm run dev:h5
```

启动微信小程序调试：

```bash
npm run dev:mp-weixin
```

也可以使用 HBuilderX 打开 `client` 目录后运行到微信开发者工具。手机或开发者工具访问本地后端时，需要将 `client/.env.development` 的 `VITE_API_BASE_URL` 改为电脑局域网 IP，例如 `http://192.168.1.10:3000/api/v1`。

## 后端启动

进入后端目录并安装依赖：

```bash
cd server
npm install
```

复制环境变量模板：

```bash
copy .env.example .env
```

编辑 `.env`，填入本机 MySQL 连接信息：

```ini
PORT=3000
CORS_ORIGIN=*
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=solar_bike
DB_USER=root
DB_PASSWORD=你的数据库密码
```

启动开发服务：

```bash
npm run dev
```

生产构建与启动：

```bash
npm run build
npm start
```

## API 规范

后端统一前缀为 `http://localhost:3000/api/v1`，统一响应结构如下：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

现有 API 模块：

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 健康检查 | `GET /health` | 检查 API 与 MySQL 是否可用。 |
| 认证 | `/auth` | 演示登录、JWT 会话刷新；生产环境待接入微信 `code2Session`。 |
| 用户 | `/users` | 当前用户资料查询与更新。 |
| 站点 | `/stations` | 查询停车区、附近站点和可用车辆数量。 |
| 车辆 | `/vehicles` | 查询附近车辆、车辆状态、车型素材与开锁。 |
| 骑行订单 | `/trips` | 开始骑行、结束骑行、骑行历史、轨迹写入。 |
| 积分 | `/points` | 查询积分余额、会员等级和积分流水。 |

详细接口见 [server/API.md](server/API.md)。健康检查可直接访问：

```text
GET http://localhost:3000/api/v1/health
```

## 数据库对接说明

后端已按提供的 SQL 映射 `users`、`vehicles`、`vehicle_models`、`colors`、`parking_zones`、`rental_orders`、`points_transactions`、`vehicle_location_history`、`trip_tracks` 与 `vehicle_model_assets`。车辆开锁、结束骑行、定位记录和积分发放使用同一个数据库事务，避免并发状态不一致。

将 SQL 导入 `tuneng_db` 后，填好 `server/.env` 并启动后端即可使用。生产环境必须关闭 `ALLOW_DEMO_LOGIN`，并将演示登录接口替换为微信服务器的 `code2Session` 流程。
