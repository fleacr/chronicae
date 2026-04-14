import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import { User } from '../types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check current session
    checkUser()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      setIsLoading(true)
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()

      if (error) {
        setError(error.message)
        setUser(null)
        return
      }

      if (supabaseUser) {
        await fetchUserProfile(supabaseUser)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to check authentication')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchUserProfile(supabaseUser: SupabaseUser) {
    try {
      // Fetch user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError)
        throw profileError
      }

      // Combine auth user with profile data
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: profile?.full_name || '',
        country: profile?.country || '',
        diseaseName: profile?.disease_name || undefined,
        createdAt: supabaseUser.created_at || new Date().toISOString()
      }

      setUser(userData)
      setError(null)
    } catch (err: any) {
      console.error('Fetch profile error:', err)
      setError(err?.message || 'Failed to load user profile')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return { user, isLoading, error }
}
