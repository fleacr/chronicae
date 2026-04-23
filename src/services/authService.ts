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
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          fullName: data.fullName,
          country: data.country,
          diseaseName: data.diseaseName || null
        }
      }
    })

    if (authError) throw authError

    const user = authData.user

    if (!user) {
      throw new Error('User not created')
    }

    // 🔴 CLAVE: verificar sesión activa
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      console.warn('No active session (email confirmation likely enabled)')
      // No insert porque RLS lo va a bloquear
      return authData
    }

    // 2. Insertar en profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: data.email,
        full_name: data.fullName,
        country: data.country,
        disease_name: data.diseaseName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile insert error:', profileError)
      throw profileError
    }

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
