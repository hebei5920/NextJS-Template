import Stripe from 'stripe';
import { NextResponse, NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Session ID is required' 
      }, { status: 400 });
    }

    // 从Stripe获取session详情
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'subscription']
    });

    // 验证支付状态
    const verificationResult = {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      amount_total: session.amount_total,
      currency: session.currency,
      created: session.created,
      subscription_id: session.subscription,
      client_reference_id: session.client_reference_id,
      success: session.payment_status === 'paid'
    };

    return NextResponse.json({
      success: true,
      data: verificationResult
    }, { status: 200 });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ 
        error: 'Invalid session ID or session not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      error: 'Failed to verify payment status' 
    }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Session ID is required' 
      }, { status: 400 });
    }

    // 从Stripe获取session详情
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 根据支付状态返回结果
    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        message: '支付已完成',
        data: {
          sessionId: session.id,
          amount: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        status: session.payment_status,
        message: '支付未完成或失败'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      error: 'Failed to verify payment status' 
    }, { status: 500 });
  }
}; 