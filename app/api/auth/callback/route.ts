import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { findOrCreateUser } from '@/db/auth'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabase = createClient()

    try {
      // 交换授权码获取会话
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
      }


      if (data.user) {
        try {

          // 使用我们的认证处理器处理用户
          console.log('Processing OAuth callback for user:', data.user.id);

          // 验证 Supabase 用户数据
          if (!data.user.id) {
            throw new Error('Invalid Supabase user: missing ID');
          }

          if (!data.user.email) {
            throw new Error('Invalid Supabase user: missing email');
          }

          // 使用 UserService 查找或创建用户
          await findOrCreateUser(data.user);
          return NextResponse.redirect(`${origin}${next}`)
        } catch (userError) {
          console.error('Error processing user in OAuth callback:', userError)
          // 用户处理失败，但 Supabase 认证成功，重定向到错误页面
          return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('用户数据处理失败')}`)
        }
      } else {
        console.error('No user data received from Supabase')
        return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('未收到用户数据')}`)
      }

    } catch (error) {
      console.error('Unexpected error in OAuth callback:', error)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('认证过程中发生错误')}`)
    }
  }

  // 没有授权码，重定向到错误页面
  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('缺少授权码')}`)
}


