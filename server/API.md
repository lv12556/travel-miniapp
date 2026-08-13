# 途能 API v1

基础地址：`/api/v1`。除登录、健康检查、车辆/站点查询外，其余接口需携带请求头：

```text
Authorization: Bearer <accessToken>
```

所有成功响应：

```json
{ "code": 0, "message": "ok", "data": {} }
```

## 认证与用户

| 方法 | 路径 | 请求体/参数 | 说明 |
| --- | --- | --- | --- |
| POST | `/auth/mini-program-login` | `openid`，可选 `nickname`、`avatar`、`phone` | 演示登录并返回 JWT。生产环境应先使用微信 `code2Session` 获取 `openid`。 |
| POST | `/auth/refresh-token` | Bearer 令牌 | 刷新当前已登录用户的令牌。 |
| GET | `/users/me` | - | 获取当前用户资料与积分。 |
| PATCH | `/users/me` | `nickname`、`avatar`、`phone` 中至少一项 | 更新用户资料。 |

## 站点、车辆和素材

| 方法 | 路径 | 请求体/参数 | 说明 |
| --- | --- | --- | --- |
| GET | `/stations` | 可选 `lat`、`lng`、`radius`（米） | 查询启用停车区；传坐标后返回距离。 |
| GET | `/stations/:stationId` | - | 获取一个停车区及其可用车辆数。 |
| GET | `/vehicles/nearby` | `lat`、`lng`，可选 `radius`、`limit` | 查询指定半径内可租车辆。 |
| GET | `/vehicles/:vehicleId` | - | 获取车辆、车型和颜色信息。 |
| GET | `/vehicles/models/:modelId/assets` | 可选 `colorId` | 查询车型图片、视频、文档资产。 |
| POST | `/vehicles/:vehicleId/unlock` | - | 开锁并创建进行中的租赁订单。 |

## 骑行与积分

| 方法 | 路径 | 请求体/参数 | 说明 |
| --- | --- | --- | --- |
| POST | `/trips/start` | `{ "vehicleId": 1 }` | 开始骑行，等价于开锁。 |
| POST | `/trips/:tripId/tracks` | `{ "lat": 31.5, "lng": 120.3 }` | 追加骑行轨迹点。 |
| POST | `/trips/:tripId/end` | `{ "lat": 31.5, "lng": 120.3 }` | 结束骑行，计算费用并发放积分。 |
| GET | `/trips/history?page=1&pageSize=20` | 分页参数可选 | 查询当前用户骑行订单。 |
| GET | `/points/summary` | - | 查询会员等级与积分余额。 |
| GET | `/points/transactions?page=1&pageSize=20` | 分页参数可选 | 查询积分流水。 |

## 状态与计费

- 可租车辆状态为 `available`；开锁后更新为 `in_use`；结束骑行后恢复 `available`。
- 订单状态为 `ongoing`、`completed`。
- 费用单位为分，按 `.env` 中的 `RENTAL_START_FEE_CENTS` 与 `RENTAL_FEE_PER_MINUTE_CENTS` 计算。
- 每次成功结束骑行，积分为 `max(10, floor(总费用 / 20))`。
