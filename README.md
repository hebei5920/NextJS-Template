# Next.js Supabase Storage Template

这是一个集成了Supabase Storage功能的Next.js模板项目。

## 功能特性

### Supabase Storage 功能
- 📁 **文件上传**: 支持图片、视频、音频文件的拖拽上传
- 🔒 **权限控制**: 用户只能管理自己的文件
- 📱 **文件管理**: 完整的文件管理界面，支持预览、下载、删除
- 🎯 **类型验证**: 自动验证文件类型和大小限制
- 📊 **批量操作**: 支持批量上传和删除
- 🎨 **响应式UI**: 适配不同设备的现代化界面

### 文件类型支持
- **图片**: JPEG, PNG, WebP, AVIF, GIF (最大10MB)
- **视频**: MP4, WebM, OGG, MOV, AVI (最大100MB)
- **音频**: MP3, WAV, OGG, AAC, WebM (最大50MB)

## 快速开始

1. 克隆项目并安装依赖:
```bash
pnpm install
```

2. 配置Supabase环境变量:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 在Supabase中创建存储桶:
```sql
-- 创建media存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- 设置RLS策略
CREATE POLICY "Users can upload their own files" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own files" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

4. 运行开发服务器:
```bash
pnpm dev
```

5. 访问存储测试页面: `http://localhost:3000/storage-test`

## API 使用

### 客户端API
```typescript
import { storageAPI } from '@/lib/storage/storage-api'

// 上传文件
const result = await storageAPI.uploadFile(file)

// 获取文件列表
const files = await storageAPI.getUserMediaFiles()

// 删除文件
await storageAPI.deleteFile(path)
```

### 服务端API
```typescript
import { serverMediaService } from '@/lib/storage/media-service'

// 上传文件
const result = await serverMediaService.uploadMedia({ file, userId })

// 获取用户文件
const files = await serverMediaService.getUserMediaFiles(userId)
```
