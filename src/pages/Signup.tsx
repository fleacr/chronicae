import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthService } from '../services/authService'
import { validateSignupForm, getAuthErrorMessage, ValidationErrors } from '../utils/validation'

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    country: 'United States',
    diseaseName: ''
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof ValidationErrors]) {
      setFieldErrors((prev: ValidationErrors) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate form inputs
    const errors = validateSignupForm(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      // Call Supabase signup
      await AuthService.signUp({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        country: formData.country,
        diseaseName: formData.diseaseName.trim() || undefined
      })

      setSuccess(true)
      
      // Redirect to login after 2 seconds to allow user to see success message
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Account created successfully! Please log in.' } 
        })
      }, 2000)
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 dark:bg-inverse-surface/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(29,27,26,0.06)]">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <button 
            onClick={() => navigate(-1)}
            className="material-symbols-outlined text-primary dark:text-primary-container"
          >
            arrow_back
          </button>
          <h1 className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Chronicae
          </h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 px-6 max-w-md mx-auto w-full">
        {/* Hero Section */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Begin your journey.</h2>
          <p className="text-on-surface-variant font-medium opacity-80">
            Chronicae tracks your resilience through every pulse of life.
          </p>
        </div>

        {/* Social Login */}
        <div className="space-y-4 mb-8">
          <button className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-surface-container-lowest border border-outline-variant/20 rounded-full shadow-sm active:scale-95 transition-transform duration-200">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold text-on-surface text-sm">Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-grow bg-outline-variant/30"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-50">or join with email</span>
            <div className="h-px flex-grow bg-outline-variant/30"></div>
          </div>
        </div>

        {/* Form */}
        {success ? (
          <div className="w-full text-center py-8">
            <div className="flex justify-center mb-4">
              <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2">Account Created!</h3>
            <p className="text-on-surface-variant mb-4">
              Redirecting to login...
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface-variant ml-1 tracking-wide">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Alex Rivera"
              className={`w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 placeholder:text-on-surface-variant/40 text-on-surface font-medium transition-all ${
                fieldErrors.fullName ? 'ring-2 ring-error' : 'focus:ring-primary/20'
              }`}
              disabled={isLoading}
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-error ml-1 mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface-variant ml-1 tracking-wide">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex@example.com"
              className={`w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 placeholder:text-on-surface-variant/40 text-on-surface font-medium transition-all ${
                fieldErrors.email ? 'ring-2 ring-error' : 'focus:ring-primary/20'
              }`}
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className="text-xs text-error ml-1 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password and Country Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface-variant ml-1 tracking-wide">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 placeholder:text-on-surface-variant/40 text-on-surface font-medium transition-all ${
                  fieldErrors.password ? 'ring-2 ring-error' : 'focus:ring-primary/20'
                }`}
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <p className="text-xs text-error ml-1 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface-variant ml-1 tracking-wide">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 text-on-surface font-medium appearance-none cursor-pointer transition-all ${
                  fieldErrors.country ? 'ring-2 ring-error' : 'focus:ring-primary/20'
                }`}
                disabled={isLoading}
              >
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
                <option>Mexico</option>
                <option>Spain</option>
              </select>
              {fieldErrors.country && (
                <p className="text-xs text-error ml-1 mt-1">{fieldErrors.country}</p>
              )}
            </div>
          </div>

          {/* Disease Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface-variant ml-1 tracking-wide">Disease name (Optional)</label>
            <input
              type="text"
              name="diseaseName"
              value={formData.diseaseName}
              onChange={handleChange}
              placeholder="e.g. Type 1 Diabetes"
              className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40 text-on-surface font-medium transition-all"
              disabled={isLoading}
            />
            <p className="text-[10px] text-on-surface-variant/60 ml-1">This helps us personalize your tracking insights.</p>
          </div>

          {/* Privacy Trust Cue */}
          <div className="flex items-start gap-3 bg-tertiary/5 p-4 rounded-xl mt-6 border border-tertiary/10">
            <span className="material-symbols-outlined text-tertiary text-xl flex-shrink-0">encrypted</span>
            <p className="text-xs leading-relaxed text-tertiary/80 font-medium">
              Your health data is encrypted and private. We never sell your personal information to third parties.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-error-container text-on-error-container text-sm">
              <div className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="bg-gradient-to-r from-primary to-primary-container w-full h-14 rounded-full text-on-primary font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">autorenew</span>
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>
        )}

        {/* Login Link */}
        {!success && (
        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant font-medium">
            Already have an account? 
            <button 
              onClick={() => navigate('/login')}
              className="text-primary font-bold hover:underline ml-1 bg-none border-none cursor-pointer"
              disabled={isLoading}
            >
              Log in
            </button>
          </p>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 flex flex-col items-center gap-4 px-8 text-center bg-transparent mt-auto">
        <div className="flex gap-6">
          <a href="#" className="font-body text-sm leading-relaxed text-on-surface-variant opacity-70 hover:text-primary underline">
            Privacy Policy
          </a>
          <a href="#" className="font-body text-sm leading-relaxed text-on-surface-variant opacity-70 hover:text-primary underline">
            Terms of Service
          </a>
        </div>
        <p className="font-body text-sm leading-relaxed text-primary">© 2024 Chronicae. All rights reserved.</p>
      </footer>

      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -z-10"></div>
      <div className="fixed bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[60px] -z-10"></div>
    </div>
  )
}
