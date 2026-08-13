# 途能小程序前端

这是基于 uni-app + Vue 3 的微信小程序/H5 前端。

## 目录职责

```text
src/
├── components/        可复用和主体验组件，TunengApp.vue 为 Figma 主体验
├── data/              本地兜底数据与只读展示内容
├── pages/             uni-app 页面路由
├── services/          后端请求及车辆业务接口
├── static/            图片、车辆素材和其他静态资源
├── styles/            全局样式变量和基础样式
├── App.vue            应用生命周期
├── main.js            uni-app/Vue 应用入口
└── pages.json         页面路由与微信 tabBar 配置
```

## 页面约定

- `pages/home/index.vue` 挂载完整的途能首页体验。
- `pages/list/index.vue`、`pages/detail/index.vue`、`pages/booking/index.vue` 提供车辆浏览、详情和预约路由。
- `pages/profile/index.vue` 保留为独立路由入口；首页内的个人中心包含完整二级页状态和详情流程。
- `data/fallback.js` 是接口不可用时的车辆/站点兜底数据。
- `data/tuneng.js` 是首页展示内容，避免把静态文案和图片路径堆在组件逻辑中。

## 启动

```bash
npm install
npm run dev:h5
```

微信开发者工具构建：

```bash
npm run dev:mp-weixin
```
