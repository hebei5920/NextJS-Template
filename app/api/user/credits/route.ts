import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { UserService } from '@/service/user-service';
import { formatCredits } from '@/lib/utils';

// GET - Get user credits information
export async function GET() {
  try {
    // Verify user identity
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    console.log("user",user);
    

    // Get user information
    const userInfo = await UserService.getUserBySupabaseId(user.id);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      credits: parseFloat(formatCredits(userInfo.credits)),
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

// POST - Manage user credits (add, deduct, set)
export async function POST(request: NextRequest) {
  try {
    // Verify user identity
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get user information
    const userInfo = await UserService.getUserBySupabaseId(user.id);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, amount } = body;

    // Validate input
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
      credits: parseFloat(formatCredits(updatedUser.credits)),
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