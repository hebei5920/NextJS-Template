# Supabase Storage 设置指南

## 🚨 重要：配置 Storage 策略

在使用 Storage 功能之前，需要在 Supabase 数据库中设置 RLS (Row Level Security) 策略。

### 步骤 1: 在 Supabase Dashboard 中执行 SQL

1. 打开你的 Supabase 项目 Dashboard
2. 进入 "SQL Editor" 
3. 复制并执行 `supabase/storage-policies.sql` 中的所有 SQL 命令

### 步骤 2: 验证设置

执行 SQL 后，你应该能看到：

1. **存储桶**: `media` 和 `test` 桶已创建
2. **策略**: 在 Authentication > Policies 中可以看到 `storage.objects` 表的策略

### 步骤 3: 测试功能

访问 `/storage-test` 页面测试上传功能。

## 📁 文件组织结构

上传的文件将按以下结构组织：

```
bucket_name/
├── user_id_1/
│   ├── image/
│   │   ├── photo_timestamp_randomid.jpg
│   │   └── avatar_timestamp_randomid.png
│   ├── video/
│   │   └── video_timestamp_randomid.mp4
│   └── audio/
│       └── music_timestamp_randomid.mp3
├── user_id_2/
│   └── ...
```

## 🔒 安全策略说明

创建的 RLS 策略确保：

- ✅ 认证用户只能访问自己的文件
- ✅ 文件路径必须以用户 ID 开头
- ✅ 公共读取访问（可选）
- ❌ 匿名用户不能上传文件

## 🛠️ 故障排除

### 错误: "new row violates row-level security policy"

**原因**: RLS 策略未正确设置

**解决方案**: 
1. 确认已执行 `supabase/storage-policies.sql` 中的所有 SQL
2. 检查用户是否已认证
3. 确认文件路径格式正确

### 错误: "Failed to create bucket"

**原因**: 权限不足或桶已存在

**解决方案**:
- 使用 Service Role Key (仅在服务端)
- 或者在 Dashboard 中手动创建存储桶

## 📚 相关文档

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [RLS 策略指南](https://supabase.com/docs/guides/storage/security/access-control) 