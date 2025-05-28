import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { AuthService } from '@/service/auth-service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabase = createClient()

    try {
      // Exchange authorization code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
      }


      if (data.user) {
        try {

          // Use our auth handler to process user
          await AuthService.handleOAuthCallback(data.user)

          return NextResponse.redirect(`${origin}${next}`)


        } catch (userError) {
          console.error('Error processing user in OAuth callback:', userError)
          // User processing failed, but Supabase auth succeeded, redirect to error page
          return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('User data processing failed')}`)
        }
      } else {
        console.error('No user data received from Supabase')
        return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('No user data received')}`)
      }

    } catch (error) {
      console.error('Unexpected error in OAuth callback:', error)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('Error occurred during authentication')}`)
    }
  }

  // No authorization code, redirect to error page
  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('Missing authorization code')}`)
}


