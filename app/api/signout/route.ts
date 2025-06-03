import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    const cookiesStore = cookies()
    const allCookies = cookiesStore.getAll()

    // 删除所有 cookie
    allCookies.forEach(ck => {
        cookiesStore.delete(ck.name)
    })

    // 特别处理 Supabase 相关的 cookie
    const supabaseCookieNames = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        'supabase.auth.token'
    ]

    supabaseCookieNames.forEach(name => {
        cookiesStore.delete(name)
        cookiesStore.set(name, '', {
            expires: new Date(0),
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })
    })

    return NextResponse.json({ success: true })
} 