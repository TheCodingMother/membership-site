'use client'

import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

interface UpgradeButtonProps {
  priceId: string
  tierName: string
}

interface SupabaseUser {
  id: string
  email: string | null
}

export default function UpgradeButton({ priceId, tierName }: UpgradeButtonProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch the logged-in user
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({ id: user.id, email: user.email })
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  // Handle upgrade button click
  const handleUpgrade = async () => {
    if (!user || !user.email) {
      return alert('You must be logged in to upgrade.')
    }

    try {
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

      const data = await response.json()
      if (!data.sessionUrl) {
        return alert('Failed to create checkout session.')
      }

      // Redirect to Stripe checkout
      window.location.href = data.sessionUrl
    } catch (err) {
      console.error('Checkout error:', err)
      alert('An error occurred while creating checkout session.')
    }
  }

  return (
    <button onClick={handleUpgrade} disabled={loading} style={{ marginRight: '1rem' }}>
      {loading ? 'Loading...' : `Upgrade to ${tierName}`}
    </button>
  )
}