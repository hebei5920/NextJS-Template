import Stripe from 'stripe'
import { NextResponse, NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

const PRICE_ID_LIST = [
    { key: 'basic', value: 'price_1RQMR0Psq011JgrIqqzrzjPR' },
    { key: 'pro', value: 'price_1RQMRLPsq011JgrImNCwJTre' },
]

export const POST = async (req: NextRequest, res: NextResponse) => {
    if (req.method === "POST") {
        try {
            const { userId, type } = await req.json()

            let price_id = PRICE_ID_LIST.find(i => i.key === type)?.value
            const params = {
                submit_type: 'pay',
                mode: 'payment',
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
            return NextResponse.json({ message: "Failed to checkout" }, { status: 500 });

        }
    } else {
        return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
    }
}