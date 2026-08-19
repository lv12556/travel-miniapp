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

## 商城、社区、通知与售后

除商品目录查询外，以下接口均需 Bearer token：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/commerce/products` | 分页查询整车、配件等商品 |
| GET | `/commerce/products/:productId` | 商品详情 |
| GET/POST | `/commerce/addresses` | 查询或新增收货地址 |
| GET/POST | `/commerce/orders` | 查询订单或创建购买订单；积分扣减与订单写入同一事务 |
| GET | `/commerce/orders/:orderId` | 订单详情及商品明细 |
| POST | `/commerce/orders/:orderId/payments/wechat` | 创建微信支付待支付记录；配置商户参数后返回真实预支付参数 |
| GET | `/community/posts` | 社区帖子分页列表 |
| POST | `/community/posts` | 发布帖子 |
| GET | `/community/posts/:postId` | 帖子详情及评论 |
| POST | `/community/posts/:postId/comments` | 发表评论 |
| POST | `/community/posts/:postId/reactions` | 切换点赞或收藏，`type` 为 `like` / `favorite` |
| GET | `/community/favorites` | 当前用户收藏的帖子 |
| GET/POST | `/community/repairs` | 报修记录或提交报修 |
| GET | `/notifications` | 通知分页及未读数 |
| GET | `/notifications/unread-count` | 首页红点使用的未读数量 |
| PATCH | `/notifications/:notificationId/read` | 标记单条已读 |
| PATCH | `/notifications/read-all` | 全部标记已读 |
| GET | `/benefits` | 当前用户优惠券/权益 |
| POST | `/benefits/claim` | 领取优惠券 |
| POST | `/benefits/:userCouponId/use` | 核销可用权益 |
| GET/POST | `/community/support/messages` | 智能客服消息历史与发送 |
