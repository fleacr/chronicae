import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { User } from '../types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let isProfileFetching = false
    let authTimeout: NodeJS.Timeout

    const initAuth = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        
        if (!isMounted) return

        if (supabaseUser && !isProfileFetching) {
          isProfileFetching = true
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single()

          if (!isMounted) return

          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            fullName: profile?.full_name || supabaseUser.user_metadata?.fullName || 'User',
            country: profile?.country || supabaseUser.user_metadata?.country || '',
            diseaseName: profile?.disease_name || supabaseUser.user_metadata?.diseaseName,
            createdAt: supabaseUser.created_at || new Date().toISOString()
          })
          isProfileFetching = false
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Auth init error:', err)
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Set a timeout to ensure loading completes
    authTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    }, 5000)

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      if (session?.user && !isProfileFetching) {
        isProfileFetching = true
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!isMounted) return

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile?.full_name || session.user.user_metadata?.fullName || 'User',
            country: profile?.country || session.user.user_metadata?.country || '',
            diseaseName: profile?.disease_name || session.user.user_metadata?.diseaseName,
            createdAt: session.user.created_at || new Date().toISOString()
          })
          setIsLoading(false)
        } catch (err) {
          console.error('Profile fetch error:', err)
          if (isMounted) {
            setIsLoading(false)
          }
        } finally {
          isProfileFetching = false
        }
      } else if (!session?.user) {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(authTimeout)
      subscription?.unsubscribe()
    }
  }, [])

  return { user, isLoading, error }
}
