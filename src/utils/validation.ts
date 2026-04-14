export interface ValidationErrors {
  fullName?: string
  email?: string
  password?: string
  country?: string
}

/**
 * Validates user signup form inputs
 * Returns object with field-level error messages if validation fails
 */
export function validateSignupForm(data: {
  fullName: string
  email: string
  password: string
  country: string
}): ValidationErrors {
  const errors: ValidationErrors = {}

  // Full Name validation
  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required'
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters'
  } else if (data.fullName.trim().length > 100) {
    errors.fullName = 'Full name must not exceed 100 characters'
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (data.password.length > 128) {
    errors.password = 'Password must not exceed 128 characters'
  }

  // Country validation
  if (!data.country) {
    errors.country = 'Please select a country'
  }

  return errors
}

/**
 * Validates user login form inputs
 */
export function validateLoginForm(data: {
  email: string
  password: string
}): Omit<ValidationErrors, 'fullName' | 'country'> {
  const errors: Omit<ValidationErrors, 'fullName' | 'country'> = {}

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  }

  return errors
}

/**
 * Extracts user-friendly error message from Supabase auth errors
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred'

  const message = error.message?.toLowerCase() || ''

  if (message.includes('email')) {
    if (message.includes('already registered')) {
      return 'This email is already registered. Please log in or use a different email.'
    }
    return 'Please check your email address'
  }

  if (message.includes('password')) {
    return 'Password does not meet requirements'
  }

  if (message.includes('invalid')) {
    return 'Invalid email or password'
  }

  if (message.includes('network')) {
    return 'Network error. Please check your connection.'
  }

  // Return a generic message for security (don't expose internals)
  return 'Failed to create account. Please try again.'
}
