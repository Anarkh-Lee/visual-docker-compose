# 🐳 Docker Compose 可视化编排工具

一款现代化的 Docker Compose 可视化生成器，通过拖拽操作快速构建容器编排配置文件。

![Docker Compose Generator](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

**演示地址：**https://compose.anarkh.site

## ✨ 功能特性

### 🎨 可视化画布
- **拖拽式操作**：从左侧组件库拖拽服务到画布，直观构建架构
- **智能连线**：点击节点端口自动创建服务依赖关系
- **实时预览**：右侧实时生成标准 `docker-compose.yml` 代码

### 📦 全能组件库 (40+ 服务)

| 分类 | 包含服务 |
|------|----------|
| 🚀 语言运行环境 | Spring Boot, Node.js, Python/Flask, Go, PHP-FPM, OpenJDK |
| 🗄️ 数据库 | MySQL, PostgreSQL, MongoDB, Redis, MariaDB, Neo4j, ClickHouse |
| 🤖 AI & 向量数据库 | Ollama, Milvus, ChromaDB, PgVector |
| 📨 消息队列 | RabbitMQ, Kafka, Zookeeper, RocketMQ, Mosquitto (MQTT) |
| ☁️ 微服务组件 | Nacos, Sentinel, Gateway, Seata |
| 📊 监控与日志 | Prometheus, Grafana, Elasticsearch, Kibana, Zipkin |
| 🔐 安全与网关 | Nginx, Traefik, Keycloak |
| 🛠️ 开发工具 | Jenkins, GitLab Runner, MinIO, Mailhog, Portainer |

### ⚡ 快速模板
一键生成常用架构：
- **Spring Cloud 全家桶**：Nacos + Redis + MySQL + Gateway + 微服务
- **ELK 日志栈**：Elasticsearch + Logstash + Kibana
- **LNMP 架构**：Linux + Nginx + MySQL + PHP
- **AI 开发环境**：Ollama + ChromaDB + Python

### 🔧 高级配置
- **数据卷挂载**：可视化配置 Host:Container 路径映射
- **环境变量**：支持 Key-Value 和 `.env` 文本批量导入两种模式
- **端口映射**：灵活配置服务端口
- **依赖管理**：通过连线自动生成 `depends_on`

### 📥 导入导出
- **导出 YAML**：一键复制生成的 docker-compose.yml
- **导入 YAML**：粘贴现有配置，自动反向生成可视化节点

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 📖 使用指南

### 基本操作

1. **添加服务**：从左侧组件库拖拽服务到画布
2. **配置属性**：点击节点，在右侧面板编辑配置
3. **创建依赖**：从一个节点的输出端口拖拽到另一个节点的输入端口
4. **生成配置**：右侧面板实时显示生成的 YAML 代码
5. **复制使用**：点击"复制代码"按钮，粘贴到项目中使用

### 快捷操作

- **使用模板**：点击顶部"快速模板"下拉菜单，一键生成常用架构
- **导入现有配置**：点击"导入 YAML"按钮，粘贴现有 docker-compose.yml
- **清空重来**：点击"清空画布"按钮重置

### 配置数据卷

1. 选中需要配置的服务节点
2. 在右侧面板找到"数据卷 (Volumes)"区域
3. 点击"+"添加挂载规则
4. 填写宿主机路径和容器路径

### 批量添加环境变量

1. 选中服务节点
2. 点击环境变量区域的"文本模式"按钮
3. 粘贴 `.env` 格式的配置：
   ```
   MYSQL_ROOT_PASSWORD=123456
   MYSQL_DATABASE=myapp
   ```
4. 切换回表单模式自动解析

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI 组件**：shadcn/ui + Radix UI
- **样式方案**：Tailwind CSS
- **流程图引擎**：React Flow
- **YAML 处理**：js-yaml

## 📁 项目结构

```
src/
├── components/
│   ├── CanvasFlow.tsx      # 画布核心组件
│   ├── ServiceNode.tsx     # 服务节点组件
│   ├── ServiceSidebar.tsx  # 左侧组件库
│   ├── PropertiesPanel.tsx # 右侧属性面板
│   ├── YamlPreview.tsx     # YAML 预览组件
│   └── ImportYamlDialog.tsx# 导入对话框
├── hooks/
│   └── useDockerCompose.ts # Docker Compose 生成逻辑
├── types/
│   └── docker.ts           # 类型定义与服务模板
└── pages/
    └── Index.tsx           # 主页面
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 🌟 Star History

如果这个项目对你有帮助，请给一个 ⭐ Star 支持！

---

**Made with ❤️ by the Community**