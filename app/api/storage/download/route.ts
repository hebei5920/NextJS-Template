import { NextRequest, NextResponse } from 'next/server'
import { createServerMediaService } from '@/service/media-service'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Check user authentication
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthenticated user' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const bucket = searchParams.get('bucket') || 'media'
    const signed = searchParams.get('signed') === 'true'
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600')
    
    if (!path) {
      return NextResponse.json(
        { error: 'File path not provided' },
        { status: 400 }
      )
    }

    // Check if file belongs to current user
    if (!path.startsWith(user.id + '/')) {
      return NextResponse.json(
        { error: 'No permission to access this file' },
        { status: 403 }
      )
    }

    // Create server-side media service instance
    const serverMediaService = createServerMediaService()

    if (signed) {
      // Get signed private download link
      const downloadUrl = await serverMediaService.getMediaDownloadUrl(path, bucket, expiresIn)
      
      return NextResponse.json({
        success: true,
        data: {
          downloadUrl,
          expiresIn
        }
      })
    } else {
      // Get public URL
      const urlResult = await serverMediaService.getPublicUrl(bucket, path)
      
      if (urlResult.error || !urlResult.data) {
        return NextResponse.json(
          { error: 'Failed to get file URL' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: {
          url: urlResult.data.publicUrl
        }
      })
    }
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Download failed' },
      { status: 500 }
    )
  }
} 