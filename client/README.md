# 途能小程序前端

这是基于 uni-app + Vue 3 的微信小程序/H5 前端。

## 目录职责

```text
src/
├── components/        主体验组件，TunengApp.vue 承载全部手机端页面与交互状态
├── data/              本地只读展示内容与静态资源路径
├── pages/             uni-app 页面路由（仅保留主入口）
├── services/          登录与通用后端请求封装
├── static/            图片、车辆素材和其他静态资源
├── styles/            全局样式变量和基础样式
├── App.vue            应用生命周期
├── main.js            uni-app/Vue 应用入口
└── pages.json         页面路由与微信 tabBar 配置
```

## 页面约定

- `pages/home/index.vue` 仅负责挂载完整的途能应用体验。
- `components/TunengApp.vue` 集中管理首页、租车、社区、商城、个人中心及各个手机端详情页。
- `data/tuneng.js` 存放首页、商品、权益等静态展示数据，避免把文案和图片路径堆在组件逻辑中。

## 启动

```bash
npm install
npm run dev:h5
```

微信开发者工具构建：

```bash
npm run dev:mp-weixin
```
