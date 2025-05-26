# Supabase 认证设置指南

本项目已集成 Supabase 认证，支持 Google 和 GitHub 登录。请按照以下步骤完成配置：

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建账户
2. 创建新项目
3. 在项目设置中找到 API 密钥

## 2. 配置环境变量

创建 `.env.local` 文件并添加以下内容：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 配置 OAuth 提供商

### Google OAuth 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID
5. 添加授权重定向 URI：
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
6. 在 Supabase 控制台的 Authentication > Providers > Google 中：
   - 启用 Google 提供商
   - 输入 Client ID 和 Client Secret

### GitHub OAuth 设置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 设置 Authorization callback URL：
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
4. 在 Supabase 控制台的 Authentication > Providers > GitHub 中：
   - 启用 GitHub 提供商
   - 输入 Client ID 和 Client Secret

## 4. 配置站点 URL

在 Supabase 控制台的 Authentication > URL Configuration 中：
- Site URL: `http://localhost:3000` (开发环境) 或您的生产域名
- Redirect URLs: 添加 `http://localhost:3000/auth/callback`

## 5. 测试认证

1. 启动开发服务器：`pnpm dev`
2. 访问 `/login` 页面
3. 尝试使用 Google 或 GitHub 登录

## 功能特性

- ✅ Google OAuth 登录
- ✅ GitHub OAuth 登录
- ✅ 自动会话管理
- ✅ 用户状态持久化
- ✅ 安全的服务端渲染
- ✅ 响应式用户界面

## 文件结构

```
lib/
├── supabase.ts              # 基础客户端配置
├── supabase-client.ts       # 浏览器端客户端
├── supabase-server.ts       # 服务端客户端
└── hooks/
    └── useAuth.ts           # 认证状态 Hook

components/auth/
├── AuthButton.tsx           # OAuth 登录按钮
└── UserProfile.tsx          # 用户资料组件

app/
├── login/
│   └── page.tsx            # 登录页面
└── auth/
    ├── callback/
    │   └── route.ts        # OAuth 回调处理
    └── auth-code-error/
        └── page.tsx        # 错误页面

middleware.ts               # 认证中间件
```

## 故障排除

1. **重定向 URI 不匹配**：确保 OAuth 应用中的重定向 URI 与 Supabase 设置一致
2. **环境变量未加载**：确保 `.env.local` 文件在项目根目录
3. **CORS 错误**：检查 Supabase 项目的 CORS 设置
4. **会话问题**：清除浏览器 cookies 并重试 