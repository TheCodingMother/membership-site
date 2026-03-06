import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '../../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' })

export async function POST(req: NextRequest) {
  try {
    const { priceId, email, userId, tierName } = await req.json()

    // 1️⃣ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      success_url: `${process.env.https://rxzdraxbxjstxsqsjcsd.supabase.co}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.https://rxzdraxbxjstxsqsjcsd.supabase.co}/posts`
    })

    // 2️⃣ Optionally, store the tier user attempted in Supabase for reference
    await supabase
      .from('profiles')
      .upsert({ id: userId, tier: 'none' })  // keep 'none' until Stripe confirms
      .select()

    return new Response(JSON.stringify({ sessionUrl: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Create checkout error:', err)
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), { status: 500 })
  }
}