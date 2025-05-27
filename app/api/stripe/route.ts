import Stripe from 'stripe'
import { NextResponse, NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

const PRICE_ID_LIST = [
    { 
        key: 'pro', 
        monthly: 'price_1RQMR0Psq011JgrIqqzrzjPR',
        yearly: 'price_1RQMR0Psq011JgrIqqzrzjPR_yearly' // 需要在Stripe控制台创建年付价格
    },
    { 
        key: 'enterprise', 
        monthly: 'price_1RQMRLPsq011JgrImNCwJTre',
        yearly: 'price_1RQMRLPsq011JgrImNCwJTre_yearly' // 需要在Stripe控制台创建年付价格
    },
]

export const POST = async (req: NextRequest, res: NextResponse) => {
    if (req.method === "POST") {
        try {
            const { userId, type, billingCycle = 'monthly' } = await req.json()

            const planConfig = PRICE_ID_LIST.find(i => i.key === type);
            if (!planConfig) {
                return NextResponse.json({ message: "Invalid plan type" }, { status: 400 });
            }

            const price_id = billingCycle === 'yearly' ? planConfig.yearly : planConfig.monthly;
            
            const params = {
                submit_type: 'pay',
                mode: billingCycle === 'yearly' ? 'subscription' : 'payment',
                payment_method_types: ['card'],
                client_reference_id: userId,
                line_items: [
                    {
                        price: price_id,
                        quantity: 1,
                    },
                ],
                success_url: `${req.headers.get("origin")}/success`,
                cancel_url: `${req.headers.get("origin")}/canceled`,
            }
            // Create Checkout Sessions from body params.
            const session = await stripe.checkout.sessions.create(params as Stripe.Checkout.SessionCreateParams);

            return NextResponse.json(session, { status: 200 });
        } catch (err) {
            console.error('Stripe checkout error:', err);
            return NextResponse.json({ message: "Failed to checkout" }, { status: 500 });

        }
    } else {
        return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
    }
}