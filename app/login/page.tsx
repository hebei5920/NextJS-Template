'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useTranslation } from '@/providers/language-provider'
import { 
  Github, 
  Chrome,
  Loader2,
  Mic,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const { user, loading, signInWithProvider } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground text-center">正在加载...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // 将重定向到首页
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithProvider(provider)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500" />

      {/* Header with theme and language switchers */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <Mic className="h-6 w-6" />
          <span className="font-semibold">返回首页</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login form */}
          <div className="glass-card p-8 rounded-2xl">
            {/* Logo and title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                欢迎使用AI语音克隆工作室
              </h1>
              <p className="text-muted-foreground">
                选择您偏好的方式登录账户
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Social login buttons */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base py-4"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Chrome className="h-5 w-5" />
                )}
                使用 Google 登录
              </button>
              
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base py-4"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Github className="h-5 w-5" />
                )}
                使用 GitHub 登录
              </button>
            </div>

            {/* Features showcase */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-center text-muted-foreground">
                登录后即可享受
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>AI语音克隆与生成</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>无限制语音文件存储</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>高级语音编辑功能</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and privacy */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              继续即表示您同意我们的
              <a href="#" className="text-primary hover:text-primary/80 transition-colors mx-1">
                服务条款
              </a>
              和
              <a href="#" className="text-primary hover:text-primary/80 transition-colors mx-1">
                隐私政策
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 