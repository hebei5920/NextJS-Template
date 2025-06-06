### 创建仓库
- 
### 生成样式

### 登录接入
- Apply for an API key( Google Githb).
- craete supabase table.
- 
### api接入
- create supabase storage
```sql
-- 创建media存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- 设置RLS策略
CREATE POLICY "Users can upload their own files" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own files" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### db
pnpm prisma generate
pnpx prisma db push

### 支付接入

### 上线
- supabase: Authentication=>URL Configuration
- change redirect uri
- pnpm install && pnpx prisma generate



 