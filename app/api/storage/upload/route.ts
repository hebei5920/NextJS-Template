import { NextRequest, NextResponse } from 'next/server'
import { createServerMediaService } from '@/service/media-service'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
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


    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'media'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create server-side media service instance
    const serverMediaService = createServerMediaService()

    // Validate file type and size
    const validation = serverMediaService.validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Upload file
    const result = await serverMediaService.uploadMedia({
      file,
      userId: user.id,
      bucket
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

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
    const bucket = searchParams.get('bucket') || 'media'

    // Create server-side media service instance
    const serverMediaService = createServerMediaService()

    // Get all user's media files
    const mediaFiles = await serverMediaService.getUserMediaFiles(user.id, bucket)

    return NextResponse.json({
      success: true,
      data: mediaFiles
    })

  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get file list' },
      { status: 500 }
    )
  }
} 