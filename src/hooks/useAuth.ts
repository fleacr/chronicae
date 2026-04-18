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

    const initAuth = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        
        if (supabaseUser && isMounted) {
          await loadProfile(supabaseUser)
        } else if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Init auth error:', err)
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    const loadProfile = async (supabaseUser: SupabaseUser) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single()

        if (isMounted) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            fullName: profile?.full_name || supabaseUser.user_metadata?.fullName || 'User',
            country: profile?.country || supabaseUser.user_metadata?.country || '',
            diseaseName: profile?.disease_name || supabaseUser.user_metadata?.diseaseName,
            createdAt: supabaseUser.created_at || new Date().toISOString()
          })
          setError(null)
        }
      } catch (err: any) {
        console.error('Load profile error:', err)
        if (isMounted) {
          // Still set user even if profile fetch fails
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            fullName: supabaseUser.user_metadata?.fullName || 'User',
            country: supabaseUser.user_metadata?.country || '',
            diseaseName: supabaseUser.user_metadata?.diseaseName,
            createdAt: supabaseUser.created_at || new Date().toISOString()
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        await loadProfile(session.user)
      } else {
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  return { user, isLoading, error }
}
