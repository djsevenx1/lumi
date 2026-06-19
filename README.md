# lumi - LunaTV Client for Lynx

基于 [Lynx](https://github.com/lynx-family/lynx) + [ReactLynx](https://lynxjs.org/) 构建的 LunaTV 跨端客户端,一套代码同时支持 iOS / Android / Web。

UI 范式对齐 [Selene](https://github.com/MoonTechLab/Selene),后端对接 [LunaTV](https://github.com/djsevenx1/LunaTV) / MoonTV 的 API。

## ✨ 功能

- 🏠 **首页**:Banner 轮播、继续观看、热门电影/剧集/动漫/综艺
- 🔍 **多源聚合搜索**:实时搜索建议、搜索历史、类型筛选
- 📄 **详情页**:海报、简介、演员、评分、集数切换、收藏
- ⭐ **我的收藏 / 播放记录**:本地缓存 + 服务端同步
- 🔐 **登录/注册**:JWT 鉴权,支持邀请码注册
- ⚙️ **设置**:API 地址配置、主题、缓存清理
- 🎬 **视频播放**:支持多清晰度、自动保存播放进度
- 📱 **底部 Tab 导航**:首页 / 搜索 / 我的 / 设置

## 🛠 技术栈

| 层级 | 技术 |
|---|---|
| UI 框架 | [Lynx](https://github.com/lynx-family/lynx) + ReactLynx |
| 构建工具 | [Rspeedy](https://lynxjs.org/guide/start/quick-start.html)(Rspack) |
| 语言 | TypeScript 5.9 |
| 状态 | 自研轻量 store(无外部依赖) |
| 持久化 | `NativeModules.Storage` 优先,降级到 `globalThis` 内存 |
| HTTP | 原生 `fetch` |
| 视频 | 占位实现(需 native 视频模块) |

## 📂 项目结构

```
src/
├── App.tsx              # 应用入口 + 路由分发
├── App.css              # 全局样式(深色主题)
├── index.tsx            # 渲染入口
├── api/
│   ├── types.ts         # LunaTV API 类型定义
│   ├── client.ts        # fetch 封装(token / 错误 / 超时)
│   ├── endpoints.ts     # 所有 API 端点
│   └── endpoints-helper.ts
├── lib/
│   ├── config.ts        # 全局配置 + 存储 key
│   ├── storage.ts       # 持久化存储(原生优先)
│   └── router.ts        # 简易状态路由
├── store/
│   └── index.ts         # 全局状态(config / auth / favorites / records)
├── components/
│   ├── TabBar.tsx       # 底部 Tab
│   ├── VideoCard.tsx    # 视频卡片 + 横向列表
│   ├── SearchBar.tsx    # 搜索输入框
│   └── Common.tsx       # Loading / Empty / Error / PosterPlaceholder
└── pages/
    ├── HomePage.tsx     # 首页
    ├── SearchPage.tsx   # 搜索
    ├── DetailPage.tsx   # 详情 + 选集
    ├── PlayerPage.tsx   # 播放
    ├── MyPage.tsx       # 我的(收藏/历史/账号)
    ├── LoginPage.tsx    # 登录/注册
    ├── SettingsPage.tsx # 设置
    └── CategoryPage.tsx # 分类浏览
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发(预览)

```bash
pnpm dev
```

启动后用 [Lynx Explorer](https://github.com/lynx-family/lynx/tree/main/explorer) App 扫码即可预览。

### 生产构建

```bash
pnpm build
```

产物:`dist/main.lynx.bundle`(约 188 KB)

### 类型检查

```bash
pnpm typecheck
```

## 📱 接入原生 App

Lynx 本身是跨端 UI 框架,`main.lynx.bundle` 是一段可以被原生壳加载的 Lynx 资源。要打包成 iOS / Android App,需要:

1. **iOS**:用 CocoaPods 集成 `Lynx` 框架,加载 `main.lynx.bundle`
2. **Android**:Gradle 依赖 `com.lynx.tasm:lynx`,加载 `main.lynx.bundle`
3. **视频播放**:Lynx 内核没有内置 `<video>` 标签,需要接入视频 native module:
   - 推荐:[@sigx/lynx-video](https://www.npmjs.com/package/@sigx/lynx-video)(iOS AVPlayer + Android Media3)
   - 自定义:实现 `NativeModules.VideoPlayer` 并注册 `<video-player>` 元素

修改 `src/pages/PlayerPage.tsx` 中的 `renderVideo()` 函数,把占位换成真实的 video 元素即可。

## ⚙️ API 对接

首次启动时,在「设置」页填入你的 LunaTV / MoonTV 后端地址(包含协议,不含尾部斜杠),例如:

```
https://moontv.example.com
```

对接的 API 端点(在 `src/api/endpoints.ts`):

| 端点 | 用途 |
|---|---|
| `POST /api/login` | 登录 |
| `POST /api/register` | 注册 |
| `GET /api/me` | 当前用户 |
| `GET /api/search?q=...&type=...` | 搜索 |
| `GET /api/detail?source=...&id=...` | 详情 |
| `GET /api/parse?source=...&id=...&episode=...` | 解析播放地址 |
| `GET /api/favorites` | 获取收藏 |
| `POST /api/favorites` | 添加收藏 |
| `DELETE /api/favorites?key=...` | 删除收藏 |
| `GET /api/playrecords` | 播放记录 |
| `POST /api/playrecords` | 保存播放记录 |
| `GET /api/douban?kind=...` | 豆瓣热门 |
| `GET /api/image-proxy?url=...&referer=...` | 图片代理(防 403) |

## 📜 License

本项目仅供学习交流使用。所有视频内容均来自第三方平台,与开发者无关。

## 🙏 致谢

- [Lynx](https://github.com/lynx-family/lynx) - 跨端 UI 框架
- [LunaTV](https://github.com/djsevenx1/LunaTV) - 后端
- [Selene](https://github.com/djsevenx1/Selene) - UI 范式参考

<!-- build trigger: 2026-06-19T11:28:10Z -->

<!-- build trigger: 2026-06-19T11:41:33Z -->
