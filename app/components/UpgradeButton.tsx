'use client'
import { supabase } from '../lib/supabase.js'
import { useEffect, useState } from 'react'

interface UpgradeButtonProps {
  priceId: string
  tierName: string
}

export default function UpgradeButton({ priceId, tierName }: UpgradeButtonProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleUpgrade = async () => {
    if (!user) return alert('You must be logged in to upgrade.')

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

    window.location.href = sessionUrl
  }

  return (
    <button onClick={handleUpgrade} disabled={loading}>
      {loading ? 'Loading...' : `Upgrade to ${tierName}`}
    </button>
  )
}