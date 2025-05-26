'use client'

import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { FaGoogle, FaGithub } from 'react-icons/fa'

interface AuthButtonProps {
  provider: 'google' | 'github'
  className?: string
}

export function AuthButton({ provider, className }: AuthButtonProps) {
  const supabase = createClient()

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      
      if (error) {
        console.error('登录错误:', error.message)
      }
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  const getIcon = () => {
    return provider === 'google' ? <FaGoogle className="mr-2" /> : <FaGithub className="mr-2" />
  }

  const getLabel = () => {
    return provider === 'google' ? '使用 Google 登录' : '使用 GitHub 登录'
  }

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      className={`w-full ${className}`}
    >
      {getIcon()}
      {getLabel()}
    </Button>
  )
} 