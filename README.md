<p align="center">
  <img src="./public/favicon.png" width="72" height="72" alt="60s-web" />
</p>

<h1 align="center">60s-web</h1>

<p align="center">
  基于 <a href="https://github.com/vikiboss/60s">vikiboss/60s</a> API 构建的开源信息聚合面板与浏览器导航首页。
</p>

<p align="center">
  <a href="https://github.com/dogxii/60s-web"><img src="https://img.shields.io/badge/GitHub-dogxii%2F60s--web-111827?logo=github" alt="GitHub repository" /></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Bun-ready-000000?logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdogxii%2F60s-web&project-name=60s-web&repository-name=60s-web">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
  </a>
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/dogxii/60s-web">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
  </a>
</p>

<p align="center">
  <a href="#一键部署">一键部署</a> ·
  <a href="#功能特性">功能特性</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#配置说明">配置说明</a> ·
  <a href="#部署">部署</a> ·
  <a href="https://github.com/vikiboss/60s">60s API</a>
</p>

![60s-web 首页截图](./docs/screenshot-home.webp)

## 简介

`60s-web` 是一个面向个人首页、自托管信息面板和轻量导航场景的 Web 应用。它将每日简报、全网热榜、城市天气、实用数据、娱乐内容和常用工具整合在一个页面中，并提供搜索跳转、主题、壁纸、头像和缓存策略等个性化能力。

项目本身是纯前端应用，不依赖数据库或自建后端。默认使用 [vikiboss/60s](https://github.com/vikiboss/60s) 提供的公开 API，也支持在页面设置中切换为自托管 API 地址。

部署案例：https://60s.dogxi.me/

## 一键部署

你可以直接通过下方入口快速创建自己的部署：

- **Vercel**：点击 README 顶部 `Deploy with Vercel` 按钮，导入仓库后即可完成部署。
- **Cloudflare**：点击 README 顶部 `Deploy to Cloudflare` 按钮，可将项目作为 Cloudflare Workers 静态资源应用快速部署。
- **Docker**：Docker 没有统一的官方“一键部署按钮”，但仓库已提供 `Dockerfile`，可以通过下方命令快速启动。

Docker 极速启动：

```bash
docker build -t 60s-web .
docker run -d --name 60s-web -p 8080:80 60s-web
```

如果你希望面向更多自部署用户，推荐优先使用顶部的 `Vercel` / `Cloudflare` 按钮，再在文档中保留 `Docker` 的快速启动说明。

## 功能特性

- **信息聚合**：今日 60 秒、历史信息、IT 资讯、AI 资讯等内容入口。
- **热榜浏览**：支持微博、知乎、B 站、抖音、头条等热榜数据源。
- **天气中心**：展示实时天气、空气质量、未来天气和城市切换。
- **实用数据**：聚合金价、油价、汇率、节假日倒计时等高频信息。
- **娱乐内容**：集成电影票房、Epic 免费游戏等轻量娱乐信息。
- **工具页面**：内置翻译、二维码、密码生成、配色方案、接口实验室和常用接口收藏。
- **导航搜索**：支持站内接口检索，并可跳转 Bing、Google、ChatGPT、豆包等搜索入口。
- **个性化设置**：支持默认城市、API 地址、模块开关、头像、壁纸、导航与 Footer 样式。
- **配置管理**：支持 API 连接检测、配置导入导出、恢复默认设置和本地缓存清理。
- **移动端体验**：支持 iOS 添加到主屏幕、独立窗口运行和移动端底部导航。
- **缓存刷新**：默认 10 分钟缓存，并自动刷新常用数据，减少重复请求。
- **部署友好**：支持 Vercel、Cloudflare Workers、Cloudflare Pages、Docker、Nginx 静态部署。

## 技术栈

| 类别             | 技术                                                            |
| ---------------- | --------------------------------------------------------------- |
| Runtime / 包管理 | Bun                                                             |
| 构建工具         | Vite                                                            |
| 前端框架         | React 19                                                        |
| 开发语言         | TypeScript                                                      |
| 图标体系         | lucide-react                                                    |
| 数据来源         | vikiboss/60s API                                                |
| 部署方式         | Vercel / Cloudflare Workers / Cloudflare Pages / Docker / Nginx |

## 快速开始

克隆项目：

```bash
git clone https://github.com/dogxii/60s-web.git
cd 60s-web
```

安装依赖并启动开发服务：

```bash
bun install
bun run dev
```

开发服务默认监听 `0.0.0.0`，本地访问：

```text
http://localhost:5173
```

构建生产版本：

```bash
bun run build
```

预览生产构建：

```bash
bun run preview
```

## 常用脚本

| 命令              | 说明                   |
| ----------------- | ---------------------- |
| `bun run dev`     | 启动本地开发服务       |
| `bun run build`   | 类型检查并构建生产版本 |
| `bun run preview` | 本地预览生产构建产物   |

## 配置说明

### API 地址

默认 API 地址：

```text
https://60s.viki.moe/v2
```

你可以在 `设置 -> 默认 API` 中替换为自己的 60s API 服务地址，并点击检测按钮验证 `/60s` 接口是否可访问。配置会保存在浏览器本地，不需要数据库或额外服务。

如需查看接口文档、部署 API 服务或参与接口项目开发，请访问：

- API 项目：[vikiboss/60s](https://github.com/vikiboss/60s)
- 前端项目：[dogxii/60s-web](https://github.com/dogxii/60s-web)

### 本地配置

应用内设置会写入浏览器 `localStorage`，包括：

- 默认城市
- API 地址
- 搜索引擎偏好
- 常用接口收藏
- 模块显示开关
- 头像与 QQ 头像缓存
- 壁纸与界面主题
- 数据缓存与刷新时间

这些配置仅保存在当前浏览器中，不会上传到服务器。

你也可以在 `设置 -> 配置管理` 中导出或导入常用配置。导出的 JSON 会包含 API 地址、默认城市、搜索偏好、主题、模块开关、首页卡片布局和常用接口收藏，但不会包含本地头像、QQ 号或自定义壁纸图片，避免生成过大的文件或意外携带个人图片。

### iOS PWA

项目内置 `manifest.webmanifest`、Apple Touch Icon 和基础 Service Worker。部署到 HTTPS 后，可在 iPhone Safari 中通过 `分享 -> 添加到主屏幕` 安装为独立窗口应用。

PWA 只缓存应用壳和静态资源，新闻、天气、热榜等 API 数据仍保持网络优先，避免离线缓存导致内容过期。移动端会显示底部主导航，设置入口保留在右上角。

## 部署

### Vercel

通过 GitHub 导入项目后，使用以下配置：

```text
Framework Preset: Vite
Install Command: bun install
Build Command: bun run build
Output Directory: dist
```

项目已内置 `vercel.json`，用于指定构建命令、输出目录和 SPA fallback。

也可以使用 Vercel CLI：

```bash
bunx vercel
bunx vercel --prod
```

### Cloudflare Workers（一键部署）

仓库顶部已提供官方 `Deploy to Cloudflare` 按钮。

该按钮适合希望**直接复制仓库并快速上线**的用户，部署目标为 **Cloudflare Workers 静态资源应用**。对于 React / Vite 这类 SPA，这种方式也可以很好地承载静态前端页面。

如果你希望继续使用传统的 Git 导入方式，也可以选择下方的 `Cloudflare Pages` 方案。

### Cloudflare Pages

在 Cloudflare Dashboard 中进入 `Workers & Pages -> Create application -> Pages`，连接 GitHub 仓库 `dogxii/60s-web` 后使用以下配置：

```text
Framework preset: Vite
Build command: bun run build
Build output directory: dist
Root directory: /
```

建议添加环境变量：

```text
BUN_VERSION=1.1.0
```

如果当前构建环境没有启用 Bun，可以改用 npm：

```text
Build command: npm install && npm run build
Build output directory: dist
```

### Docker

Docker 方案适合：

- 本地快速运行
- 服务器自托管
- 配合 Portainer / 1Panel / Dokploy / CasaOS 等面板部署

构建镜像：

```bash
docker build -t 60s-web .
```

运行容器：

```bash
docker run -d --name 60s-web -p 8080:80 60s-web
```

访问：

```text
http://localhost:8080
```

> 说明：Docker 本身没有像 Vercel / Cloudflare 那样统一、通用的官方“一键部署按钮”，因此这里保留为最快可复制执行的启动方式。

### Docker Compose

```yaml
services:
  60s-web:
    image: 60s-web
    build: .
    ports:
      - '8080:80'
    restart: unless-stopped
```

启动：

```bash
docker compose up -d
```

### Nginx 静态部署

生成静态文件：

```bash
bun install
bun run build
```

将 `dist/` 上传到服务器，并配置 SPA fallback：

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/60s-web/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 部署检查

部署完成后建议检查以下内容：

- 首页能够正常加载每日简报、热榜、天气和实用数据。
- 页面刷新后仍能保持当前主题、城市、头像和壁纸设置。
- 设置页中 API 检测能够给出连接成功、地址无效或请求失败提示。
- 配置导入导出和恢复默认设置能够正常工作。
- 工具页常用接口收藏能够在刷新后保留，并能快速切换到对应接口。
- iPhone Safari 可以添加到主屏幕，打开后显示独立窗口和底部导航。
- 断网后应用壳能够打开，API 内容显示现有失败提示。
- 直接访问子路径时能够回退到 `index.html`。
- 如果使用自托管 API，确认浏览器控制台没有跨域错误。
- 如果公开部署，请确认 API 地址可被目标网络访问。

## 目录结构

```text
.
├── docs/                 # README 截图等文档资源
├── public/               # favicon 等静态资源
├── src/                  # 应用源码
├── Dockerfile            # Docker 镜像构建
├── nginx.conf            # 容器内 Nginx 配置
├── vercel.json           # Vercel 部署配置
├── wrangler.jsonc        # Cloudflare Workers 部署配置
└── vite.config.ts        # Vite 配置
```

## 适用场景

- 浏览器默认首页
- 自托管信息聚合面板
- 60s API 的可视化前端
- 个人服务器或家庭网络的信息入口
- 轻量导航页和常用工具页

## 致谢

感谢 [vikiboss/60s](https://github.com/vikiboss/60s) 提供稳定、易用的开放接口。本项目主要负责前端展示、交互体验、个性化配置和部署体验。

如果你需要单独部署或扩展接口服务，请优先阅读上游 API 项目的文档和许可说明。

## License

MIT [@Dogxi](https://github.com/dogxii)
