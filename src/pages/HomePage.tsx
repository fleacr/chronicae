import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PainLogService } from '../services/painLogService'
import Card from '../components/Card'

export default function HomePage() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const [weeklyData, setWeeklyData] = useState<{ [key: string]: number }>({
    'Monday': 0,
    'Tuesday': 0,
    'Wednesday': 0,
    'Thursday': 0,
    'Friday': 0,
    'Saturday': 0,
    'Sunday': 0
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('User not authenticated, redirecting to login')
      navigate('/login', { replace: true })
    }
  }, [isLoading, user, navigate])

  // Fetch weekly pain log data
  useEffect(() => {
    if (!isLoading && user) {
      fetchWeeklyData()
    }
  }, [user, isLoading])

  const fetchWeeklyData = async () => {
    try {
      const stats = await PainLogService.getWeeklyStats(user!.id)
      
      // Initialize with 0 values
      const dailyData: { [key: string]: number } = {
        'Monday': 0,
        'Tuesday': 0,
        'Wednesday': 0,
        'Thursday': 0,
        'Friday': 0,
        'Saturday': 0,
        'Sunday': 0
      }

      // Calculate average pain level for each day
      Object.entries(stats).forEach(([day, painLevels]: [string, number[]]) => {
        if (painLevels.length > 0) {
          const avgPain = Math.round(painLevels.reduce((a, b) => a + b, 0) / painLevels.length)
          dailyData[day] = avgPain
        }
      })

      setWeeklyData(dailyData)
    } catch (error) {
      console.error('Error fetching weekly stats:', error)
      // Keep default 0 values
    } finally {
      // Keep loading state reset
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">autorenew</span>
          <p className="text-on-surface-variant">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-background text-on-surface min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(29,27,26,0.06)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-fixed flex items-center justify-center">
              <img
                src="/logo-chronicae.png"
                alt="Chronicae Phoenix Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">Chronicae</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden hover:opacity-80 transition-opacity"
            >
              <div className="w-full h-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        {/* Greeting Section */}
        <section className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Welcome back, {user.fullName}!</h1>
          <p className="text-on-surface-variant text-lg">How are you feeling today?</p>
        </section>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Pain Log Card (Hero) */}
          <Card
            onClick={() => navigate('/pain-log')}
            title="Pain Log"
            description="Track daily pain level (1–10) with notes and visual markers."
            variant="hero"
            className="md:col-span-2 relative overflow-hidden group"
            isClickable
          >
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-white text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    vital_signs
                  </span>
                </div>
                <span className="material-symbols-outlined text-white/50 text-3xl">arrow_forward_ios</span>
              </div>
              <div>
                <h2 className="text-white text-3xl font-bold mb-2">Pain Log</h2>
                <p className="text-white/80 text-base max-w-[240px]">
                  Track daily pain level (1–10) with notes and visual markers.
                </p>
              </div>
            </div>
            {/* Abstract Pulse Decoration */}
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <span className="material-symbols-outlined text-[200px] text-white">pulse_alert</span>
            </div>
          </Card>

          {/* Triggers & Relief Card */}
          <Card
            onClick={() => alert('Coming soon: Triggers & Relief')}
            icon="balance"
            title="Triggers & Relief"
            description="Log causes or relief actions to find patterns in your health journey."
          />

          {/* Reports Card */}
          <Card
            onClick={() => alert('Coming soon: Reports')}
            icon="description"
            title="Reports"
            description="Generate health summaries & PDF reports for your clinical visits."
          />

          {/* Community Feed Card (Disabled) */}
          <Card
            onClick={() => {}}
            icon="group"
            title="Community Feed"
            description="Insights from users with similar conditions and shared experiences."
            variant="disabled"
            className="md:col-span-2 flex items-center justify-between"
            isClickable={false}
          >
            <div className="flex gap-4 items-start flex-1">
              <div className="w-12 h-12 bg-surface-container-highest text-on-surface-variant rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">group</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-on-surface">Community Feed</h3>
                  <span className="px-2 py-0.5 bg-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-full text-on-surface-variant">
                    Coming soon
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Insights from users with similar conditions and shared experiences.
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0">lock</span>
          </Card>
        </div>

        {/* Weekly Resilience Section */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6 text-on-surface">Weekly Resilience</h3>
          <div className="bg-surface-container-low rounded-[2rem] p-8">
            <div className="flex items-end justify-between h-40 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const painLevel = weeklyData[day] || 0
                // Convert pain level (0-10) to height percentage (0-100%)
                const heightPercent = (painLevel / 10) * 100
                const dayAbbr = day.substring(0, 1)
                
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-primary/20 rounded-t-full h-40 relative flex items-end justify-center">
                      {painLevel > 0 && (
                        <div
                          className="w-full bg-gradient-to-t from-primary-container to-primary rounded-t-full transition-all duration-300 flex items-end justify-center pb-2"
                          style={{ height: `${heightPercent}%` }}
                        >
                          <span className="text-[10px] font-bold text-white mb-1">{painLevel}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant">{dayAbbr}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl shadow-[0_-8px_24px_rgba(29,27,26,0.06)] rounded-t-[2rem] z-40">
        <button
          onClick={() => navigate('/pain-log')}
          className="flex flex-col items-center justify-center bg-primary-fixed text-on-primary rounded-full px-5 py-2 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            edit_note
          </span>
          <span className="text-[10px] font-semibold uppercase mt-1 tracking-widest">Journal</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-2 hover:bg-surface-container-low rounded-full transition-transform active:scale-90">
          <span className="material-symbols-outlined">query_stats</span>
          <span className="text-[10px] font-semibold uppercase mt-1 tracking-widest">Insights</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-2 hover:bg-surface-container-low rounded-full transition-transform active:scale-90">
          <span className="material-symbols-outlined">description</span>
          <span className="text-[10px] font-semibold uppercase mt-1 tracking-widest">Reports</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-2 hover:bg-surface-container-low rounded-full transition-transform active:scale-90"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-semibold uppercase mt-1 tracking-widest">Profile</span>
        </button>
      </nav>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/pain-log')}
        className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-full shadow-[0_8px_24px_rgba(172,45,0,0.3)] text-on-primary flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] bg-primary-fixed opacity-5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 left-[-5%] w-[60%] h-[60%] bg-tertiary-fixed opacity-10 blur-[100px] rounded-full"></div>
      </div>
    </div>
  )
}
