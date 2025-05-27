'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { User, AuthError } from '@supabase/supabase-js'

// 本地存储的键名
const USER_STORAGE_KEY = 'voiceCloning_user'
const USER_SESSION_KEY = 'voiceCloning_session'

// 用户信息接口
interface StoredUserInfo {
  id: string
  email: string
  user_metadata?: any
  app_metadata?: any
  created_at?: string
  last_sign_in_at?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 从本地存储获取用户信息
  const getUserFromStorage = (): StoredUserInfo | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY)
      if (stored) {
        const userInfo = JSON.parse(stored)
        // 验证存储的数据是否有效
        if (userInfo.id && userInfo.email) {
          return userInfo
        }
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error)
      localStorage.removeItem(USER_STORAGE_KEY)
    }
    
    return null
  }

  // 将用户信息存储到本地
  const saveUserToStorage = (user: User) => {
    if (typeof window === 'undefined') return
    
    try {
      const userInfo: StoredUserInfo = {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo))
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(userInfo))
    } catch (error) {
      console.error('Error saving user to localStorage:', error)
    }
  }

  // 清除本地存储的用户信息
  const clearUserFromStorage = () => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(USER_STORAGE_KEY)
    sessionStorage.removeItem(USER_SESSION_KEY)
  }

  useEffect(() => {
    // 首先尝试从本地存储获取用户信息
    const storedUser = getUserFromStorage()
    if (storedUser) {
      // 将存储的用户信息转换为 User 对象
      const restoredUser: User = {
        id: storedUser.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: storedUser.email,
        email_confirmed_at: undefined,
        phone: undefined,
        phone_confirmed_at: undefined,
        confirmation_sent_at: undefined,
        confirmed_at: undefined,
        recovery_sent_at: undefined,
        user_metadata: storedUser.user_metadata || {},
        app_metadata: storedUser.app_metadata || {},
        created_at: storedUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in_at: storedUser.last_sign_in_at || undefined
      }
      setUser(restoredUser)
      // 立即设置 loading 为 false，避免用户信息闪烁
      setLoading(false)
    }

    // 获取初始用户状态
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser(currentUser)
        saveUserToStorage(currentUser)
      } else if (!storedUser) {
        setUser(null)
      }
      setLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      
      if (sessionUser) {
        saveUserToStorage(sessionUser)
      } else {
        clearUserFromStorage()
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // 社交登录
  const signInWithProvider = async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    
    if (error) throw error
    return data
  }

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      clearUserFromStorage()
      setUser(null)
    }
    return { error }
  }

  return {
    user,
    loading,
    signInWithProvider,
    signOut,
    // 导出工具函数供其他组件使用
    saveUserToStorage,
    clearUserFromStorage,
    getUserFromStorage
  }
} 