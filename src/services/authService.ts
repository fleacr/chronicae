import { supabase } from './supabaseClient'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  country: string
  diseaseName?: string
}

export interface LoginData {
  email: string
  password: string
}

export class AuthService {
  static async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            fullName: data.fullName,
            country: data.country
          }
        }
      })

      if (authError) throw authError

      // Update the profile with additional data
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: data.fullName,
            country: data.country,
            disease_name: data.diseaseName || null
          })
          .eq('id', authData.user.id)

        if (profileError) {
          console.warn('Profile update warning:', profileError)
        }
      }

      console.log('Signup successful:', authData)
      return authData
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  static async login(data: LoginData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) throw error

      return authData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  static async updateProfile(userId: string, data: Partial<SignUpData>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          country: data.country,
          disease_name: data.diseaseName
        })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  static async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }
}
