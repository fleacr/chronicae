import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AuthService } from '../services/authService'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [isLoading, user, navigate])

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">autorenew</span>
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="bg-surface-container border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Chronicae
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <section className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight">Welcome, {user.fullName}!</h2>
            <p className="text-on-surface-variant text-lg">
              You're successfully logged into Chronicae. Your health data is safe and encrypted.
            </p>
          </section>

          {/* User Profile Card */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-on-surface-variant/70">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant/70">Full Name</p>
                  <p className="font-medium">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant/70">Country</p>
                  <p className="font-medium">{user.country}</p>
                </div>
                {user.diseaseName && (
                  <div>
                    <p className="text-xs text-on-surface-variant/70">Tracking</p>
                    <p className="font-medium">{user.diseaseName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface">Days Active</span>
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface">Entries</span>
                  <span className="text-2xl font-bold text-primary">0</span>
                </div>
              </div>
            </div>
          </section>

          {/* Coming Soon Features */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: 'edit_note', title: 'Log Symptoms', desc: 'Track your daily symptoms and pain levels' },
                { icon: 'assessment', title: 'Analytics', desc: 'View patterns and insights in your data' },
                { icon: 'notifications', title: 'Reminders', desc: 'Set daily reminders for tracking' }
              ].map((feature) => (
                <div key={feature.title} className="bg-surface-container rounded-xl p-4 border border-outline-variant/20 opacity-60">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">
                    {feature.icon}
                  </span>
                  <h4 className="font-bold mb-1">{feature.title}</h4>
                  <p className="text-sm text-on-surface-variant">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-8 border-t border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-on-surface-variant">
            © 2024 Chronicae. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
