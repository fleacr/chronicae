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
    let authTimeout: NodeJS.Timeout | null = null

    // Set a timeout to ensure loading completes (increased to 10s)
    authTimeout = setTimeout(() => {
      if (isMounted) {
        console.log('Auth timeout reached, forcing loading to complete')
        setIsLoading(false)
      }
    }, 10000)

    // Listen for auth changes - this is the main source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      if (session?.user && !isProfileFetching) {
        isProfileFetching = true
        
        // Create user with auth data first
        const baseUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.fullName || 'User',
          country: session.user.user_metadata?.country || '',
          diseaseName: session.user.user_metadata?.diseaseName,
          createdAt: session.user.created_at || new Date().toISOString()
        }

        // Set user immediately with auth data
        setUser(baseUser)
        setIsLoading(false)

        // Try to enhance with profile data (but don't block)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (isMounted && profile) {
            setUser({
              ...baseUser,
              fullName: profile.full_name || baseUser.fullName,
              country: profile.country || baseUser.country,
              diseaseName: profile.disease_name || baseUser.diseaseName
            })
          }
        } catch (profileErr) {
          console.warn('Profile fetch failed, using auth data:', profileErr)
          // Keep baseUser as is
        }

        isProfileFetching = false
      } else if (!session?.user) {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      if (authTimeout) {
        clearTimeout(authTimeout)
      }
      subscription?.unsubscribe()
    }
  }, [])

  return { user, isLoading, error }
}
