'use client'

import { AuthTest } from '@/components/auth/AuthTest'
import { AuthButton } from '@/components/auth/AuthButton'
import { UserProfile } from '@/components/auth/UserProfile'

export default function TestPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Supabase 认证测试页面</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 用户资料组件测试 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">用户资料组件</h2>
            <UserProfile />
          </div>
          
          {/* 登录按钮测试 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">登录按钮测试</h2>
            <div className="space-y-4">
              <AuthButton provider="google" />
              <AuthButton provider="github" />
            </div>
          </div>
        </div>
        
        {/* 认证状态测试 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <AuthTest />
        </div>
        
        {/* 说明信息 */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">使用说明</h2>
          <div className="space-y-2 text-sm">
            <p>1. 确保已配置 <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> 文件</p>
            <p>2. 在 Supabase 控制台中配置 Google 和 GitHub OAuth</p>
            <p>3. 设置正确的重定向 URL: <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:3000/auth/callback</code></p>
            <p>4. 点击上方的登录按钮测试认证流程</p>
            <p>5. 查看认证状态测试结果</p>
          </div>
        </div>
      </div>
    </div>
  )
} 