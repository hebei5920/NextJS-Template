import { createClient } from "@/lib/supabase-server";
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access voice generations' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const modelId = searchParams.get('modelId');

    let voiceGenerations;
    
    if (modelId) {
      // 获取特定模型的语音生成历史
      voiceGenerations = await prisma.voice.findMany({
        where: {
          userId: user.id,
          vmId: modelId
        },
        include: {
          voiceModel: {
            select: {
              displayName: true,
              avatarImage: true,
              gender: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // 获取用户的所有语音生成历史
      voiceGenerations = await prisma.voice.findMany({
        where: {
          userId: user.id
        },
        include: {
          voiceModel: {
            select: {
              displayName: true,
              avatarImage: true,
              gender: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });
    }

    return NextResponse.json({
      success: true,
      data: voiceGenerations
    });

  } catch (error) {
    console.error('Get voice generations error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 验证用户身份
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to delete voice generations' },
        { status: 401 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { voiceId } = body;

    if (!voiceId || typeof voiceId !== 'number') {
      return NextResponse.json(
        { error: 'Voice ID is required and must be a number' },
        { status: 400 }
      );
    }

    // 删除语音生成记录
    await prisma.voice.delete({
      where: {
        id: voiceId,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Voice generation deleted successfully'
    });

  } catch (error) {
    console.error('Delete voice generation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 