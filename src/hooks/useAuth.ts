import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import { User } from '../types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // Check current session
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()

        if (error) {
          if (isMounted) {
            setError(error.message)
            setUser(null)
            setIsLoading(false)
          }
          return
        }

        if (supabaseUser) {
          await fetchUserProfile(supabaseUser)
        } else {
          if (isMounted) {
            setUser(null)
            setIsLoading(false)
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to check authentication')
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          if (isMounted) {
            setUser(null)
            setIsLoading(false)
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  async function fetchUserProfile(supabaseUser: SupabaseUser, isInitial = true) {
    if (!isInitial) setIsLoading(true)
    try {
      // Fetch user profile from profiles table
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      // If profile doesn't exist (PGRST116), create one with basic data
      if (profileError?.code === 'PGRST116') {
        console.log('Profile not found, creating new one...')
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: supabaseUser.id,
              email: supabaseUser.email,
              full_name: supabaseUser.user_metadata?.fullName || 'User',
              country: supabaseUser.user_metadata?.country || '',
              disease_name: supabaseUser.user_metadata?.diseaseName || null
            }
          ])

        if (insertError) {
          console.error('Error creating profile:', insertError)
          // Still set user even if profile creation fails
        } else {
          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single()
          
          if (!fetchError) {
            profile = newProfile
          }
        }
      } else if (profileError) {
        console.error('Profile fetch error:', profileError)
        throw profileError
      }

      // Combine auth user with profile data (or defaults if no profile)
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: profile?.full_name || supabaseUser.user_metadata?.fullName || 'User',
        country: profile?.country || supabaseUser.user_metadata?.country || '',
        diseaseName: profile?.disease_name || supabaseUser.user_metadata?.diseaseName || undefined,
        createdAt: supabaseUser.created_at || new Date().toISOString()
      }

      if (isMounted) {
        setUser(userData)
        setError(null)
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('Fetch profile error:', err)
      if (isMounted) {
        setError(err?.message || 'Failed to load user profile')
        // Set minimal user data so app doesn't break
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: 'User',
          country: '',
          createdAt: supabaseUser.created_at || new Date().toISOString()
        })
        setIsLoading(false)
      }
    }
  }

  return { user, isLoading, error }
}
