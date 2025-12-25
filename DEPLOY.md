# 部署指南 | Deployment Guide

本项目是纯前端应用，可以部署到任何静态托管平台。以下是主流平台的详细部署教程。

---

## 目录

- [Cloudflare Pages（推荐）](#cloudflare-pages推荐)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [GitHub Pages](#github-pages)
- [自托管 (Nginx)](#自托管-nginx)

---

## Cloudflare Pages（推荐）

Cloudflare Pages 提供免费的全球 CDN、自动 HTTPS 和无限带宽。

### 方式一：GitHub 自动部署

1. **将代码推送到 GitHub 仓库**

2. **登录 Cloudflare Dashboard**
   - 访问 [dash.cloudflare.com](https://dash.cloudflare.com)
   - 进入 **Workers & Pages** → **Create** → **Pages**

3. **连接 GitHub 仓库**
   - 选择 "Connect to Git"
   - 授权 Cloudflare 访问你的 GitHub
   - 选择项目仓库

4. **配置构建设置**

   | 配置项 | 值 |
   |--------|-----|
   | 框架预设 | `Vite` |
   | 构建命令 | `bun install && npm run build` |
   | 构建输出目录 | `dist` |
   | Node.js 版本 | `18` 或更高 |

   > ⚠️ **重要**: 如果使用 Bun 作为包管理器，需要在 **Environment variables** 中设置：
   > - 变量名：`SKIP_DEPENDENCY_INSTALL`，值：`true`
   > 
   > 然后在构建命令中添加安装步骤：`bun install && npm run build`
   > 
   > 或者在 **Settings → Builds & deployments** 中将安装命令从 `bun install --frozen-lockfile` 改为 `bun install`

5. **点击 "Save and Deploy"**

### 方式二：Wrangler CLI 手动部署

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建项目
npm run build

# 部署
wrangler pages deploy dist --project-name=docker-compose-generator
```

### 绑定自定义域名

1. 进入项目 → **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入域名并按提示配置 DNS

---

## Vercel

Vercel 是 Next.js 的创建者，对前端项目有极好的支持。

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### 手动部署步骤

1. **登录 [Vercel](https://vercel.com)**

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 连接 GitHub 并选择仓库

3. **配置构建设置**

   | 配置项 | 值 |
   |--------|-----|
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. **点击 "Deploy"**

### Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署（首次会有交互式配置）
vercel

# 部署到生产环境
vercel --prod
```

---

## Netlify

Netlify 提供简单易用的部署体验和丰富的插件生态。

### 一键部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### 手动部署步骤

1. **登录 [Netlify](https://app.netlify.com)**

2. **创建新站点**
   - 点击 "Add new site" → "Import an existing project"
   - 连接 GitHub 并选择仓库

3. **配置构建设置**

   | 配置项 | 值 |
   |--------|-----|
   | Build command | `npm run build` |
   | Publish directory | `dist` |

4. **点击 "Deploy site"**

### Netlify CLI 部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化项目
netlify init

# 构建并部署
npm run build
netlify deploy --prod --dir=dist
```

---

## GitHub Pages

GitHub Pages 是 GitHub 提供的免费静态托管服务。

### 配置步骤

1. **修改 `vite.config.ts`**（如果仓库名不是用户名.github.io）

   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... 其他配置
   })
   ```

2. **创建 GitHub Actions 工作流**

   创建文件 `.github/workflows/deploy.yml`：

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build
           run: npm run build
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 `gh-pages` 分支

---

## 自托管 (Nginx)

如果你有自己的服务器，可以使用 Nginx 进行部署。

### 部署步骤

1. **构建项目**

   ```bash
   npm run build
   ```

2. **上传 `dist` 目录到服务器**

   ```bash
   scp -r dist/* user@your-server:/var/www/docker-compose-generator/
   ```

3. **配置 Nginx**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/docker-compose-generator;
       index index.html;

       # 启用 Gzip 压缩
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

       # SPA 路由支持
       location / {
           try_files $uri $uri/ /index.html;
       }

       # 静态资源缓存
       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **重载 Nginx**

   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 配置 HTTPS（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 环境变量

本项目是纯前端应用，不需要配置环境变量。

如需自定义配置，可以在构建时设置：

```bash
# 示例：设置 API 地址（如果将来需要）
VITE_API_URL=https://api.example.com npm run build
```

---

## 常见问题

### Q: 部署后页面空白？

检查浏览器控制台是否有资源加载 404 错误。如果有，可能需要配置 `vite.config.ts` 中的 `base` 选项。

### Q: 刷新页面 404？

这是 SPA 路由问题，需要配置服务器将所有请求重定向到 `index.html`。各平台配置方式：

- **Cloudflare Pages**: 自动支持
- **Vercel**: 自动支持
- **Netlify**: 创建 `public/_redirects` 文件，内容：`/* /index.html 200`
- **Nginx**: 参考上文 `try_files` 配置

### Q: 构建失败？

确保 Node.js 版本 >= 18，并检查是否有 TypeScript 类型错误：

```bash
npm run build
```

### Q: Cloudflare Pages 报错 "lockfile had changes, but lockfile is frozen"？

这是 Bun lockfile 版本不兼容导致的。解决方法：

1. 进入项目 **Settings → Builds & deployments**
2. 找到 **Build configurations** 部分
3. 将安装命令从 `bun install --frozen-lockfile` 改为 `bun install`
4. 保存并重新部署

或者设置环境变量 `SKIP_DEPENDENCY_INSTALL=true`，然后将构建命令改为 `bun install && npm run build`

---

## 推荐配置

| 平台 | 免费额度 | 推荐场景 |
|------|---------|---------|
| Cloudflare Pages | 无限带宽、500次构建/月 | 生产环境首选 |
| Vercel | 100GB带宽/月 | 快速预览、小型项目 |
| Netlify | 100GB带宽/月 | 需要表单/函数功能 |
| GitHub Pages | 1GB存储、100GB带宽/月 | 开源项目文档 |

---

如有问题，欢迎提交 Issue！
