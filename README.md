# Next.js 基础框架

一个包含用户认证、国际化、主题切换等基础功能的 Next.js 项目模板。

## 功能特性

- ✅ **用户认证系统** - 基于 NextAuth.js
- ✅ **多种登录方式** - 支持邮箱密码、Google OAuth、GitHub OAuth
- ✅ **数据库集成** - MongoDB + Mongoose
- ✅ **国际化支持** - 多语言切换（中文、英文等）
- ✅ **主题系统** - 深色/浅色主题切换
- ✅ **响应式设计** - 基于 Tailwind CSS
- ✅ **TypeScript** - 完整的类型支持
- ✅ **路由保护** - 基于中间件的认证保护

## 技术栈

- **框架**: Next.js 13.5.1
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **认证**: NextAuth.js
- **数据库**: MongoDB + Mongoose
- **状态管理**: React Context
- **主题**: next-themes
- **表单**: React Hook Form + Zod

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd nextjs-base-template
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# MongoDB 数据库
MONGODB_URI=mongodb://localhost:27017/your-database

# Google OAuth (可选)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (可选)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                    # Next.js 13 App Router
│   ├── api/               # API 路由
│   │   ├── auth/         # 认证相关 API
│   │   └── users/        # 用户相关 API
│   ├── login/            # 登录页面
│   ├── profile/          # 个人资料页面
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/            # React 组件
│   ├── providers/        # Context 提供者
│   ├── language-provider.tsx  # 国际化提供者
│   └── theme-provider.tsx     # 主题提供者
├── lib/                   # 工具函数和配置
│   ├── i18n/             # 国际化配置
│   ├── auth-utils.ts     # 认证工具
│   ├── db.ts             # 数据库连接
│   └── utils.ts          # 通用工具
├── models/               # 数据库模型
│   ├── User.ts           # 用户模型
│   └── index.ts          # 模型导出
├── types/                # TypeScript 类型定义
└── middleware.ts         # Next.js 中间件
```

## 核心功能说明

### 用户认证

- 支持邮箱密码登录
- 支持 Google OAuth 登录
- 支持 GitHub OAuth 登录
- 自动处理用户注册和登录状态

### 国际化

- 支持多语言切换
- 基于 React Context 的状态管理
- 本地存储用户语言偏好
- 自动检测浏览器语言

### 主题系统

- 支持深色/浅色主题
- 系统主题自动跟随
- 本地存储主题偏好

### 数据库

- MongoDB 数据库连接
- Mongoose ODM
- 用户模型定义
- 连接池管理

## 自定义配置

### 添加新语言

1. 在 `lib/i18n/locales/` 目录下创建新的语言文件
2. 更新 `lib/i18n/index.ts` 中的语言配置
3. 在组件中使用 `useTranslation` Hook

### 添加新的认证提供者

1. 在 `app/api/auth/[...nextauth]/route.ts` 中添加新的 Provider
2. 配置相应的环境变量
3. 更新登录页面 UI

### 扩展用户模型

1. 修改 `models/User.ts` 中的用户模型
2. 更新相关的 TypeScript 类型
3. 在认证回调中处理新字段

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 其他平台

确保配置正确的环境变量，特别是：
- `NEXTAUTH_URL` - 生产环境的完整 URL
- `MONGODB_URI` - 生产数据库连接字符串
- OAuth 应用的回调 URL

## 开发指南

### 添加新页面

1. 在 `app/` 目录下创建新的路由文件夹
2. 添加 `page.tsx` 文件
3. 如需要认证保护，确保中间件配置正确

### 添加新 API

1. 在 `app/api/` 目录下创建 API 路由
2. 使用 `connectDB()` 连接数据库
3. 处理认证和授权

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！ 