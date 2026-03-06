'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase' // adjust path if needed

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(error.message)
      return
    }

    const userId = data.user?.id
    if (userId) {
      // insert profile row only if userId exists
      await supabase.from('profiles').insert([{ user_id: userId, email, tier: 'none' }])
    }

    setMessage('Signup successful! Check your email to confirm.')
    router.push('/check-email') // keep this page simple with instructions
  }

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Login successful!')
    router.push('/posts')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Signup / Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', margin: '1rem 0', padding: '0.5rem' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', margin: '1rem 0', padding: '0.5rem' }}
      />
      <button onClick={handleSignup} style={{ marginRight: '1rem' }}>Sign Up</button>
      <button onClick={handleLogin}>Log In</button>
      <p>{message}</p>
    </div>
  )
}