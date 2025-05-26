import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { UserService } from '@/service/user-service';

// GET - 获取用户积分信息
export async function GET() {
  try {
    // 验证用户身份
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    console.log("user",user);
    

    // 获取用户信息
    const userInfo = await UserService.getUserBySupabaseId(user.id);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      credits: userInfo.credits,
      plan: userInfo.plan,
      success: true 
    });

  } catch (error) {
    console.error('Error getting user credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST - 管理用户积分（增加、扣减、设置）
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 获取用户信息
    const userInfo = await UserService.getUserBySupabaseId(user.id);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { action, amount } = body;

    // 验证输入
    if (!action || !['add', 'deduct', 'set'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "add", "deduct", or "set"' }, 
        { status: 400 }
      );
    }

    if (amount === undefined || amount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a non-negative number' }, 
        { status: 400 }
      );
    }

    let updatedUser;

    try {
      switch (action) {
        case 'add':
          updatedUser = await UserService.addUserCredits(userInfo.id, amount);
          break;
        case 'deduct':
          updatedUser = await UserService.deductUserCredits(userInfo.id, amount);
          break;
        case 'set':
          updatedUser = await UserService.updateUserCredits(userInfo.id, amount);
          break;
        default:
          throw new Error('Invalid action');
      }
    } catch (serviceError: any) {
      return NextResponse.json(
        { error: serviceError.message }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      credits: updatedUser.credits,
      plan: updatedUser.plan,
      action,
      amount,
      success: true 
    });

  } catch (error) {
    console.error('Error managing user credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 