# AI 语音克隆工作室 (Voice Cloning Studio)

一个基于 Next.js 构建的现代化AI语音克隆应用，提供完整的语音克隆工作流程，包括音频录制、文件上传、文本转语音生成等功能。

## ✨ 主要功能

### 🎙️ 语音克隆核心功能
- **音频录制**: 支持实时录音，最少3秒，带有音频波形可视化
- **文件上传**: 支持 MP3、WAV、OGG、AAC、WebM 格式，拖拽上传
- **文本转语音**: 使用上传的音色样本生成自定义语音
- **音频播放**: 内置播放器，支持播放、暂停、下载功能

### 🎨 多主题系统
- **6种颜色主题**: Default、Ocean、Galaxy、Forest、Sunset、Rose
- **明暗模式**: 支持系统自动切换或手动选择
- **主题持久化**: 自动保存用户偏好设置

### 🌍 多语言支持
- **12种语言**: 中文、英文、日文、韩文、法文、德文、西班牙文、俄文、阿拉伯文、印地文、葡萄牙文、意大利文
- **动态切换**: 实时语言切换，无需刷新页面
- **本地化存储**: 自动保存语言偏好

### 💰 定价系统
- **三种套餐**: Free、Pro、Enterprise
- **月付/年付**: 支持灵活的计费周期
- **功能对比**: 清晰的功能差异展示

### 📱 现代化UI设计
- **响应式设计**: 完美适配桌面端和移动端
- **玻璃拟态效果**: 现代化的视觉设计
- **流畅动画**: 丰富的交互动画效果
- **无障碍支持**: 符合WCAG标准

## 🚀 技术栈

- **前端框架**: Next.js 13.5.1 (App Router)
- **UI组件**: React 18.2.0 + TypeScript
- **样式系统**: Tailwind CSS + CSS Variables
- **主题管理**: next-themes
- **图标库**: Lucide React
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **支付**: Stripe
- **部署**: Vercel (推荐)

## 📦 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── generation/    # 语音生成API
│   ├── globals.css        # 全局样式和主题
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 主页
├── components/            # React 组件
│   ├── ui/               # 基础UI组件
│   │   ├── theme-switcher.tsx
│   │   └── language-switcher.tsx
│   ├── voice-cloning/    # 语音克隆组件
│   │   ├── voice-cloning-studio.tsx
│   │   ├── audio-recorder.tsx
│   │   ├── file-uploader.tsx
│   │   ├── text-to-speech.tsx
│   │   └── generation-history.tsx
│   └── pricing/          # 定价组件
│       └── pricing-plans.tsx
├── providers/            # Context 提供器
│   ├── theme-provider.tsx
│   └── language-provider.tsx
├── i18n/                # 国际化配置
├── lib/                 # 工具库
└── types/              # TypeScript 类型定义
```

## 🛠️ 安装和运行

### 环境要求
- Node.js 18.0+
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 环境变量配置
创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe 配置 (可选)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# 其他配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🎯 核心功能使用指南

### 1. 语音录制
1. 点击"录制音频"选项卡
2. 点击"开始录音"按钮
3. 清晰朗读至少3秒钟的内容
4. 点击"停止录音"完成录制
5. 可以播放预览或重新录制

### 2. 文件上传
1. 点击"上传文件"选项卡
2. 拖拽音频文件到上传区域，或点击选择文件
3. 支持的格式：MP3、WAV、OGG、AAC、WebM
4. 文件大小限制：50MB

### 3. 文本转语音
1. 完成音频录制或上传后，点击"开始生成语音"
2. 在文本框中输入要转换的文字（最多500字符）
3. 可以选择示例文本快速填充
4. 点击"生成语音"开始处理
5. 生成完成后可以播放、下载音频

### 4. 主题切换
- 点击右上角的太阳/月亮图标切换明暗模式
- 点击调色板图标选择颜色主题
- 设置会自动保存到本地存储

### 5. 语言切换
- 点击右上角的语言选择器
- 选择您偏好的语言
- 界面会立即切换到选定语言

## 🔧 自定义配置

### 添加新的颜色主题
1. 在 `app/globals.css` 中添加新的主题CSS变量
2. 在 `components/ui/theme-switcher.tsx` 中添加主题选项
3. 更新 `providers/theme-provider.tsx` 中的类型定义

### 添加新语言
1. 在 `i18n/` 目录下创建新的语言文件
2. 更新 `i18n/index.ts` 中的语言配置
3. 在 `components/ui/language-switcher.tsx` 中添加语言选项

### 集成真实的AI语音服务
1. 替换 `app/api/generation/route.ts` 中的模拟逻辑
2. 集成如 ElevenLabs、Azure Speech、Google Cloud TTS 等服务
3. 更新 `components/voice-cloning/text-to-speech.tsx` 中的API调用

## 📝 API 文档

### POST /api/generation
生成语音克隆

**请求体:**
```json
{
  "text": "要转换的文本",
  "voiceUrl": "音色文件URL"
}
```

**响应:**
```json
{
  "success": true,
  "message": "Voice generation completed successfully",
  "data": {
    "text": "要转换的文本",
    "audioUrl": "生成的音频URL",
    "duration": 5,
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide](https://lucide.dev/) - 图标库
- [Supabase](https://supabase.com/) - 后端服务
- [Vercel](https://vercel.com/) - 部署平台

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 邮箱: support@voicecloning.studio
- GitHub Issues: [提交问题](https://github.com/your-username/voice-cloning-studio/issues)
- 官网: [https://voicecloning.studio](https://voicecloning.studio)

---

**让每个人都能拥有属于自己的AI语音助手** 🎙️✨

## 功能特性

### 语音克隆系统
- **语音模型管理** (`/models`)
  - 查看所有语音模型
  - 显示模型统计信息（总数、男声/女声分布）
  - 删除语音模型（包括相关的所有生成记录）
  - 模型详情查看

- **语音生成历史** (`/history`)
  - 查看所有语音生成记录
  - 显示生成统计信息（总生成数、总字符数、使用模型数）
  - 音频播放/暂停控制
  - 音频文件下载
  - 删除生成记录

### API 端点

#### 语音模型 API (`/api/voice`)
- `GET` - 获取用户的语音模型列表
- `POST` - 创建新的语音生成
- `DELETE` - 删除语音模型及其相关生成记录

#### 语音生成 API (`/api/voice/generations`)
- `GET` - 获取用户的语音生成历史
- `DELETE` - 删除特定的语音生成记录

### 删除功能说明

1. **删除语音模型**：
   - 删除模型时会同时删除该模型的所有语音生成记录
   - 需要用户确认操作
   - 提供成功/失败反馈

2. **删除语音生成记录**：
   - 只删除单条生成记录
   - 不影响语音模型
   - 需要用户确认操作
   - 提供成功/失败反馈

### 安全特性
- 用户身份验证
- 权限验证（只能删除自己的记录）
- 错误处理和用户反馈

## 使用方法

1. 访问 `/models` 查看和管理语音模型
2. 访问 `/history` 查看和管理语音生成记录
3. 使用删除按钮时会弹出确认对话框
4. 删除操作完成后会显示相应的成功或错误消息

## 技术栈

- Next.js 14
- TypeScript
- Prisma ORM
- Supabase Auth
- Tailwind CSS
