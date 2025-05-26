# Next.js 基础框架

一个包含国际化、主题切换等基础功能的 Next.js 项目模板。

## 功能特性

- ✅ **国际化支持** - 多语言切换（中文、英文等）
- ✅ **主题系统** - 深色/浅色主题切换
- ✅ **响应式设计** - 基于 Tailwind CSS
- ✅ **TypeScript** - 完整的类型支持

## 技术栈

- **框架**: Next.js 13.5.1
- **语言**: TypeScript
- **样式**: Tailwind CSS
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

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                    # Next.js 13 App Router
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/            # React 组件
│   ├── language-provider.tsx  # 国际化提供者
│   ├── language-switcher.tsx  # 语言切换器
│   └── theme-provider.tsx     # 主题提供者
├── i18n/                  # 国际化配置
│   ├── locales/          # 语言文件
│   │   ├── en.ts         # 英文翻译
│   │   └── zh.ts         # 中文翻译
│   └── index.ts          # 国际化配置
├── lib/                   # 工具函数和配置
│   └── utils.ts          # 通用工具
└── types/                # TypeScript 类型定义
```

## 核心功能说明

### 国际化

- 支持多语言切换
- 基于 React Context 的状态管理
- 本地存储用户语言偏好
- 自动检测浏览器语言

### 主题系统

- 支持深色/浅色主题
- 系统主题自动跟随
- 本地存储主题偏好

## 自定义配置

### 添加新语言

1. 在 `i18n/locales/` 目录下创建新的语言文件
2. 更新 `i18n/index.ts` 中的语言配置
3. 在组件中使用 `useTranslation` Hook

### 自定义主题

1. 修改 `tailwind.config.ts` 中的主题配置
2. 使用 `useTheme` Hook 在组件中访问主题状态

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 部署

### 其他平台

确保项目构建成功即可在任何支持 Node.js 的平台上部署。

## 开发指南

### 添加新页面

1. 在 `app/` 目录下创建新的路由文件夹
2. 添加 `page.tsx` 文件
3. 使用国际化和主题功能

### 添加新组件

1. 在 `components/` 目录下创建组件文件
2. 使用 `useTranslation` Hook 获取翻译
3. 使用 Tailwind CSS 实现响应式设计

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！ 