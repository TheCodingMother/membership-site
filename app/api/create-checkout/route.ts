import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' })

export async function POST(req: Request) {
  const { priceId, email, userId, tierName } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?userId=${userId}&tierName=${tierName}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
  })

  return NextResponse.json({ sessionUrl: session.url })
}