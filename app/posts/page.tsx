'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase.js'
import UpgradeButton from '../components/UpgradeButton'

interface Post {
  id: string
  title: string
  content: string
  required_tier: string
}

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [message, setMessage] = useState('Loading...')
  const [userTier, setUserTier] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        // 1️⃣ Get current logged-in user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth')
          return
        }

        // 2️⃣ Get user's tier from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tier')
          .eq('user_id', user.id)
          .single()

        if (profileError || !profile) {
          setMessage('Profile not found.')
          return
        }

        const tier = profile.tier
        setUserTier(tier)

        // 3️⃣ Show upgrade buttons if tier is 'none'
        if (!tier || tier === 'none') {
          setMessage('You must upgrade to access posts.')
          return
        }

        // 4️⃣ Fetch posts allowed for user's tier
        const allowedTiers =
          tier === 'Core' ? ['Starter', 'Core'] : ['Starter']

        const { data: postsData, error } = await supabase
          .from('posts')
          .select('*')
          .in('required_tier', allowedTiers)

        if (error) {
          console.error(error)
          setMessage('Error loading posts.')
        } else {
          setPosts(postsData || [])
          setMessage('') // clear message if posts exist
        }
      } catch (err) {
        console.error(err)
        setMessage('Unexpected error occurred.')
      }
    }

    fetchPosts()
  }, [router])

  // 5️⃣ Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut({ global: true })
    if (error) {
      console.error('Logout error:', error)
    } else {
      router.push('/auth')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Logout button */}
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
        Logout
      </button>

      {/* Show upgrade buttons only if tier is 'none' */}
      {userTier === 'none' && (
        <div style={{ marginBottom: '2rem' }}>
          <p>You must upgrade to access posts:</p>
          <UpgradeButton priceId="prod_U4tLhXwdqUPPFT" tierName="Starter" />
          <UpgradeButton priceId="prod_U4tLWuGSWiX3rf" tierName="Core" />
        </div>
      )}

      <h1>Your Content</h1>

      {/* Show message if no posts or blocked */}
      {message && <p>{message}</p>}

      {/* Render posts */}
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            margin: '1rem 0',
            border: '1px solid #ccc',
            padding: '1rem'
          }}
        >
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  )
}