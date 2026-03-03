'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase.js'

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    async function fetchPosts() {
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
        .eq('id', user.id)   // ✅ IMPORTANT: use id, not user_id
        .single()

      if (profileError || !profile) {
        setMessage('Profile not found.')
        return
      }

      const userTier = profile.tier

      // 3️⃣ Block access if tier is 'none'
      if (!userTier || userTier === 'none') {
        setMessage('You must pay to access content.')
        return
      }

      // 4️⃣ Fetch posts allowed for tier
      const allowedTiers =
        userTier === 'Core'
          ? ['Starter', 'Core']
          : ['Starter']

      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .in('required_tier', allowedTiers)

      if (error) {
        setMessage('Error loading posts.')
      } else {
        setPosts(postsData || [])
        setMessage('')
      }
    }

    fetchPosts()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
        Logout
      </button>

      <h1>Your Content</h1>

      {message && <p>{message}</p>}

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