'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'

export function AuthTest() {
  const { user, loading } = useAuth()
  const supabase = createClient()

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      console.log('Supabase 连接测试:', { data, error })
      
      if (error) {
        alert(`连接错误: ${error.message}`)
      } else {
        alert(`连接成功! 会话状态: ${data.session ? '已登录' : '未登录'}`)
      }
    } catch (error) {
      console.error('测试失败:', error)
      alert('测试失败，请检查控制台')
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">认证状态测试</h3>
      
      <div className="space-y-3">
        <div>
          <strong>加载状态:</strong> {loading ? '加载中...' : '已加载'}
        </div>
        
        <div>
          <strong>用户状态:</strong> {user ? '已登录' : '未登录'}
        </div>
        
        {user && (
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium mb-2">用户信息:</h4>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>邮箱:</strong> {user.email}</p>
            <p><strong>提供商:</strong> {user.app_metadata?.provider}</p>
            <p><strong>姓名:</strong> {user.user_metadata?.full_name}</p>
            <p><strong>头像:</strong> {user.user_metadata?.avatar_url ? '有' : '无'}</p>
          </div>
        )}
        
        <Button onClick={testConnection} variant="outline">
          测试 Supabase 连接
        </Button>
      </div>
    </div>
  )
} 