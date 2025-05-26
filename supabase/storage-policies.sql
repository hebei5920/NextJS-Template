-- Supabase Storage RLS 策略设置
-- 运行这些 SQL 命令来设置 Storage 的访问权限

-- 1. 创建 media 存储桶（如果还不存在）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 创建 test 存储桶（如果还不存在）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('test', 'test', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 设置 storage.objects 表的 RLS 策略

-- 允许认证用户查看自己上传的文件
CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT 
    TO authenticated
    USING ( (select auth.uid()::text) = (storage.foldername(name))[1] );

-- 允许认证用户上传文件到自己的文件夹
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK ( (select auth.uid()::text) = (storage.foldername(name))[1] );

-- 允许认证用户更新自己的文件
CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE 
    TO authenticated
    USING ( (select auth.uid()::text) = (storage.foldername(name))[1] )
    WITH CHECK ( (select auth.uid()::text) = (storage.foldername(name))[1] );

-- 允许认证用户删除自己的文件
CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE 
    TO authenticated
    USING ( (select auth.uid()::text) = (storage.foldername(name))[1] );

-- 3. 设置公共访问策略（可选）
-- 如果需要公共读取访问，可以添加这个策略
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT 
    TO public
    USING ( bucket_id = 'media' );

-- 4. 确保 RLS 已启用
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 