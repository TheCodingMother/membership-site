'use client'  // ✅ Must be the very first line

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase.js'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  // 1️⃣ Signup function
  const handleSignup = async () => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setMessage(signUpError.message)
      console.log('SignUp Error:', signUpError)
      return
    }

    console.log('SignUp Data:', signUpData)

    const userId = signUpData.user?.id
    if (!userId) {
      setMessage('Signup successful! Please confirm your email before logging in.')
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ user_id: userId, email, tier: 'none' }])

    if (profileError) {
      console.log('Profile creation error:', profileError)
      setMessage('Signup failed to create profile. Check console.')
    } else {
      console.log('Profile created successfully for user:', email)
      setMessage('Signup successful! Check your email to confirm.')
    }

    router.push('/pricing')  // Redirect after signup
  }

  // 2️⃣ Login function
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Logged in successfully!')
    router.push('/posts')  // Redirect after login
  }

  // ✅ JSX return must be **inside the component**, after all functions**
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
      <button
        onClick={handleSignup}
        style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}
      >
        Sign Up
      </button>
      <button onClick={handleLogin} style={{ padding: '0.5rem 1rem' }}>
        Log In
      </button>
      <p>{message}</p>
    </div>
  )
}