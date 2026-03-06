'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'                 // correct path
import UpgradeButton from './components/UpgradeButton'    // correct path
import { Profile, Post } from '../types'

export default function DashboardPage() {
  const router = useRouter()
  const [userTier, setUserTier] = useState<string>('none')
  const [posts, setPosts] = useState<Post[]>([])
  const [message, setMessage] = useState<string>('Loading...')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth')
          return
        }

        let { data: profile } = await supabase
          .from<Profile>('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        // Auto-create profile if missing
        if (!profile) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({ id: user.id, tier: 'none' })
            .select()
            .maybeSingle()

          if (!newProfile) {
            setMessage('Error loading profile.')
            setLoading(false)
            return
          }
          profile = newProfile
        }

        setUserTier(profile.tier || 'none')

        // Fetch posts allowed for the user's tier
        const allowedTiers = profile.tier === 'Core' ? ['Starter', 'Core'] : ['Starter']
        const { data: postsData } = await supabase
          .from<Post>('posts')
          .select('*')
          .in('required_tier', allowedTiers)

        setPosts(postsData || [])
        setMessage(postsData?.length ? '' : 'No content available for your tier.')
      } catch (err) {
        console.error(err)
        setMessage('Unexpected error occurred.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut({ global: true })
    if (error) console.error('Logout error:', error)
    else router.push('/auth')
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
        Logout
      </button>

      <h1>Welcome to Your Academy</h1>
      <p>Tier: {userTier}</p>

      {userTier === 'none' && (
        <div style={{ marginBottom: '2rem' }}>
          <p>You must upgrade to access content:</p>
          <UpgradeButton priceId="prod_U4tLhXwdqUPPFT" tierName="Starter" />
          <UpgradeButton priceId="prod_U4tLWuGSWiX3rf" tierName="Core" />
        </div>
      )}

      <h2>Your Content</h2>
      {message && <p>{message}</p>}

      {posts.map((post) => (
        <div key={post.id} style={{ margin: '1rem 0', border: '1px solid #ccc', padding: '1rem' }}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  )
}