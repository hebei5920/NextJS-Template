
在Supabase中创建存储桶:
```sql
-- 创建media存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- 设置RLS策略
CREATE POLICY "Users can upload their own files" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own files" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```
 


Install Command：
pnpm install && npx prisma generate


Build Command：
pnpm run build
