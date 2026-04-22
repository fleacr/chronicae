import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { User } from '../types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!isMounted) return

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.fullName || 'User',
          country: session.user.user_metadata?.country || '',
          diseaseName: session.user.user_metadata?.diseaseName,
          createdAt: session.user.created_at || new Date().toISOString()
        })
      } else {
        setUser(null)
      }

      setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.fullName || 'User',
            country: session.user.user_metadata?.country || '',
            diseaseName: session.user.user_metadata?.diseaseName,
            createdAt: session.user.created_at || new Date().toISOString()
          })
        } else {
          setUser(null)
        }

        setIsLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}