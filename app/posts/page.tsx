'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import UpgradeButton from '../components/UpgradeButton'

// Types
interface Post {
  id: string
  title: string
  content: string
  required_tier: string
}

interface Profile {
  id: string
  tier: string
}

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [message, setMessage] = useState('Loading...')
  const [userTier, setUserTier] = useState<string>('none')
  const [loading, setLoading] = useState<boolean>(true)

  // Function to fetch user profile and posts
  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Fetch profile by user id
      let { data: profile } = await supabase
        .from<Profile>('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // Auto-create if missing
      if (!profile) {
        const { data: newProfile } = await supabase
          .from<Profile>('profiles')
          .insert({ id: user.id, tier: 'none' })
          .select()
          .maybeSingle()
        profile = newProfile
      }

      const tier = profile?.tier || 'none'
      setUserTier(tier)

      // Block unpaid users
      if (tier === 'none') {
        setMessage('You must upgrade to access posts.')
        setPosts([])
        setLoading(false)
        return
      }

      // Determine allowed tiers
      const allowedTiers = tier === 'Core' ? ['Starter', 'Core'] : ['Starter']

      const { data: postsData, error } = await supabase
        .from<Post>('posts')
        .select('*')
        .in('required_tier', allowedTiers)

      if (error) {
        console.error(error)
        setMessage('Error loading posts.')
      } else {
        setPosts(postsData || [])
        setMessage(postsData?.length ? '' : 'No posts available for your tier.')
      }

    } catch (err) {
      console.error(err)
      setMessage('Unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh tier after Stripe checkout
  useEffect(() => {
    loadData()

    // Poll Supabase every 5 seconds for tier updates
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
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

      {userTier === 'none' && (
        <div style={{ marginBottom: '2rem' }}>
          <p>You must upgrade to access posts:</p>
          <UpgradeButton priceId={process.env.STRIPE_STARTER_PRICE_ID!} tierName="Starter" />
          <UpgradeButton priceId={process.env.STRIPE_CORE_PRICE_ID!} tierName="Core" />
        </div>
      )}

      <h1>Your Content</h1>
      {message && <p>{message}</p>}

      {posts.map((post) => (
        <div
          key={post.id}
          style={{ margin: '1rem 0', border: '1px solid #ccc', padding: '1rem' }}
        >
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  )
}