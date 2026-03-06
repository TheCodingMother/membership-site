import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '../../../lib/supabase' // adjust path if needed

// Stripe secret from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  // 1️⃣ Get raw body
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // 2️⃣ Verify the Stripe webhook
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // 3️⃣ Handle relevant events
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      const customerEmail = session.customer_email
      const metadata = session.metadata || {}
      const userId = metadata.userId
      const tierName = metadata.tierName

      if (!userId || !tierName) {
        console.error('Missing userId or tierName in metadata')
        break
      }

      // 4️⃣ Update Supabase profile tier
      const { error } = await supabase
        .from('profiles')
        .update({ tier: tierName })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user tier in Supabase:', error.message)
      } else {
        console.log(`User ${userId} upgraded to ${tierName}`)
      }
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}