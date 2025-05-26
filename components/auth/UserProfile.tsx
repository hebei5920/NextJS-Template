'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export function UserProfile() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse">
          <div className="rounded-full bg-gray-300 h-8 w-8"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <a href="/login">
          <Button variant="outline">登录</Button>
        </a>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        {user.user_metadata?.avatar_url && (
          <Image
            src={user.user_metadata.avatar_url}
            alt="用户头像"
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {user.user_metadata?.full_name || user.email}
          </span>
          <span className="text-xs text-gray-500">
            {user.email}
          </span>
        </div>
      </div>
      
      <Button 
        onClick={handleSignOut}
        variant="outline"
        size="sm"
      >
        退出
      </Button>
    </div>
  )
}