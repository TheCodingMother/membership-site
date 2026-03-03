'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase.js'

export default function SuccessPage() {
  const params = useSearchParams()
  const userId = params.get('userId')
  const tierName = params.get('tierName')

  useEffect(() => {
    async function updateTier() {
      if (!userId || !tierName) return
      await supabase.from('profiles').update({ tier: tierName }).eq('user_id', userId)
    }
    updateTier()
  }, [userId, tierName])

  return <h1>Thank you! Your tier has been upgraded to {tierName}</h1>
}