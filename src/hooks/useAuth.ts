import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { User } from '../types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let isProfileFetching = false
    let authTimeout: ReturnType<typeof setTimeout> | null = null

    const initAuth = async () => {
      try {
        // Get current session immediately
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return

        if (session?.user) {
          // User exists - set immediately with auth data
          const baseUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.fullName || 'User',
            country: session.user.user_metadata?.country || '',
            diseaseName: session.user.user_metadata?.diseaseName,
            createdAt: session.user.created_at || new Date().toISOString()
          }

          setUser(baseUser)
          
          // Try to fetch full profile (non-blocking)
          if (!isProfileFetching) {
            isProfileFetching = true
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
              console.warn('Profile fetch failed:', profileErr)
            } finally {
              isProfileFetching = false
            }
          }
        } else {
          // No session
          setUser(null)
        }
      } catch (err) {
        console.error('Auth init error:', err)
        setUser(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Initialize immediately
    initAuth()

    // Set timeout as safety net (10 seconds - longer to allow profile fetch)
    authTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log('Auth timeout - forcing loading complete')
        setIsLoading(false)
      }
    }, 10000)

    // Also listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      if (session?.user && !isProfileFetching) {
        isProfileFetching = true
        
        const baseUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.fullName || 'User',
          country: session.user.user_metadata?.country || '',
          diseaseName: session.user.user_metadata?.diseaseName,
          createdAt: session.user.created_at || new Date().toISOString()
        }

        setUser(baseUser)
        setIsLoading(false)

        // Enhance with profile
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
          console.warn('Profile listener fetch failed:', profileErr)
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

  return { user, isLoading }
}
