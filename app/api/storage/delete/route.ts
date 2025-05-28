import { NextRequest, NextResponse } from 'next/server'
import { createServerMediaService } from '@/service/media-service'
import { createClient } from '@/lib/supabase-server'

export async function DELETE(request: NextRequest) {
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
    
    // Also support getting path list from body for batch deletion
    const body = await request.json().catch(() => ({}))
    const paths = body.paths as string[]
    
    if (!path && (!paths || paths.length === 0)) {
      return NextResponse.json(
        { error: 'File path not provided' },
        { status: 400 }
      )
    }

    // Create server-side media service instance
    const serverMediaService = createServerMediaService()

    if (path) {
      // Single file deletion
      // Check if file belongs to current user
      if (!path.startsWith(user.id + '/')) {
        return NextResponse.json(
          { error: 'No permission to delete this file' },
          { status: 403 }
        )
      }

      const success = await serverMediaService.deleteMediaFile(path, bucket)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete file' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      })
    } else {
      // Batch deletion
      // Check if all files belong to current user
      const invalidPaths = paths.filter(p => !p.startsWith(user.id + '/'))
      if (invalidPaths.length > 0) {
        return NextResponse.json(
          { error: 'Some files cannot be deleted due to permission restrictions' },
          { status: 403 }
        )
      }

      const result = await serverMediaService.deleteMediaFiles(paths, bucket)
      
      return NextResponse.json({
        success: true,
        data: result
      })
    }
    
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deletion failed' },
      { status: 500 }
    )
  }
} 