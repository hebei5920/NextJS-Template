import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { UserService } from '@/service/user-service';
import { formatCredits } from '@/lib/utils';

// GET - Get user plan information
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

    // Get user information
    const userInfo = await UserService.getUserBySupabaseId(user.id);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      plan: userInfo.plan,
      credits: parseFloat(formatCredits(userInfo.credits)),
      success: true 
    });

  } catch (error) {
    console.error('Error getting user plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST - Update user plan
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
    const { plan } = body;

    // Validate plan type
    const validPlans = ['free', 'basic', 'pro', 'enterprise'];
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${validPlans.join(', ')}` }, 
        { status: 400 }
      );
    }

    try {
      // Use UserService's updateUserPlan method
      const updatedUser = await UserService.updateUserPlan(userInfo.id, plan);

      return NextResponse.json({ 
        plan: updatedUser.plan,
        credits: parseFloat(formatCredits(updatedUser.credits)),
        success: true 
      });
    } catch (serviceError: any) {
      return NextResponse.json(
        { error: serviceError.message }, 
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 