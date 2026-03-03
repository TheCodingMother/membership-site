'use client'

import { supabase } from '../lib/supabase.js'

interface UpgradeButtonProps {
  priceId: string  // Stripe Price ID for Starter or Core
  tierName: string // 'Starter' or 'Core'
}

export default function UpgradeButton({ priceId, tierName }: UpgradeButtonProps) {
  const handleUpgrade = async () => {
    // 1️⃣ Get current logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('You must be logged in to upgrade.')

    // 2️⃣ Call your Stripe API to create checkout session
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        email: user.email,
        userId: user.id,
        tierName
      })
    })

    const { sessionUrl } = await response.json()
    if (!sessionUrl) return alert('Failed to create checkout session.')

    // 3️⃣ Redirect user to Stripe checkout
    window.location.href = sessionUrl
  }

  return (
    <button onClick={handleUpgrade}>
      Upgrade to {starter, core}
    </button>
  )
}