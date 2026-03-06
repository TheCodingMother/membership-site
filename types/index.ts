// types/index.ts

// Profile interface for Supabase
export interface Profile {
  id: string       // matches supabase.auth user ID
  tier: string     // 'none', 'Starter', 'Core', etc.
}

// Post interface
export interface Post {
  id: string
  title: string
  content: string
  required_tier: string   // 'Starter', 'Core', etc.