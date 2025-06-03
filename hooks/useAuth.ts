'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'
import { cookies } from 'next/headers';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const signOut = () => {
    const cookiesStore = cookies()
    const allCookies = cookiesStore.getAll()
    allCookies.forEach(ck => {
      cookiesStore.delete(ck.name)
    })


    const supabaseCookieNames = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ];

    supabaseCookieNames.forEach(name => {
      cookiesStore.delete(name);
      cookiesStore.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    supabase.auth.signOut()
  }

  useEffect(() => {
    // 获取初始用户状态
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return {
    user,
    loading,
    signOut
  }
} 