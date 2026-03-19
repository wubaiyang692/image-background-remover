# Image Background Remover

一个在线图片背景去除工具，上传图片后自动去除背景，下载透明 PNG。

## 技术栈

- **前端**: Next.js 15 + Tailwind CSS
- **后端**: Next.js API Route (Edge Runtime)
- **抠图**: [remove.bg API](https://www.remove.bg/api)
- **部署**: Cloudflare Pages

## 本地开发

```bash
npm install
# 配置环境变量
cp .env.example .env.local
# 填入你的 remove.bg API Key
npm run dev
```

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `REMOVE_BG_API_KEY` | remove.bg API Key，在 [remove.bg](https://www.remove.bg/api) 获取 |

## 部署到 Cloudflare Pages

1. 将代码推送到 GitHub
2. Cloudflare Pages 连接该仓库
3. 构建命令：`npm run build`，输出目录：`.next`
4. 在 Settings → Environment Variables 中添加 `REMOVE_BG_API_KEY`

## 功能

- 支持点击选择 / 拖拽上传
- 支持 JPG、PNG、WebP，最大 10MB
- 原图与结果图对比预览
- 一键下载透明背景 PNG
- 图片不存储、不记录
