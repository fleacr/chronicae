export interface User {
  id: string
  email: string
  fullName: string
  country: string
  diseaseName?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}
