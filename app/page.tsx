'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'

export default function Page() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase.from('posts').select('*')

      if (error) console.log('Supabase error:', error)
      else setPosts(data as any[])
    }

    fetchPosts()
  }, [])

  return (
    <div>
      <h1>Supabase Test</h1>
      {posts.length === 0 ? <p>No posts found</p> : (
        posts.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  )
}