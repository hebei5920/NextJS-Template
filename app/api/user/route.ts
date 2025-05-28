import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { AuthService } from '@/service/auth-service'

export async function GET() {
  try {
    // Get current Supabase user
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // Get user information from database
    const userInfo = await AuthService.getUserInfo(user.id)

    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found in database' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      user: userInfo,
      success: true 
    })

  } catch (error) {
    console.error('Error in user API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 