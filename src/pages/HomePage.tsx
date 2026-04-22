import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PainLogService } from '../services/painLogService'
import { AuthService } from '../services/authService'
import { supabase } from '../services/supabaseClient'
import Card from '../components/Card'

// Helper function to get the last 7 days ending with today (as YYYY-MM-DD in UTC)
const getLast7Days = () => {
  const last7Days = []
  const today = new Date()
  
  // Get today's UTC date string (YYYY-MM-DD)
  const todayStr = today.toISOString().split('T')[0]
  const todayUTC = new Date(todayStr + 'T00:00:00Z')
  
  // Get the last 7 days ending with today (including today)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayUTC)
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    last7Days.push(dateKey)
  }
  
  console.log('Last 7 days:', last7Days)
  return last7Days
}

// Helper function to get day abbreviation from date string (YYYY-MM-DD)
const getDayAbbr = (dateStr: string): string => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const date = new Date(dateStr + 'T00:00:00Z')
  return dayNames[date.getUTCDay()]
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)
  
  // Get the last 7 days array (today will be the last element)
  const last7Days = useMemo(() => getLast7Days(), [])
  
  // Initialize weeklyData with the actual 7-day sequence
  const [weeklyData, setWeeklyData] = useState<{ [key: string]: number }>(() => {
    const initialData: { [key: string]: number } = {}
    last7Days.forEach(day => {
      initialData[day] = 0
    })
    return initialData
  })

  // Track mount/unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Redirect to login only after we confirm no session exists
  useEffect(() => {
    let isEffectMounted = true

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isEffectMounted) return

        if (!session) {
          console.log('No session found, redirecting to login')
          navigate('/login', { replace: true })
        } else {
          console.log('Session confirmed, user authenticated')
        }
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        // Always mark as checked, whether session exists or not
        if (isEffectMounted) {
          setSessionChecked(true)
        }
      }
    }

    // Check session immediately on mount
    checkSession()

    return () => {
      isEffectMounted = false
    }
  }, [navigate])

  // Fetch weekly pain log data when user is available
  useEffect(() => {
    if (user && sessionChecked) {
      fetchWeeklyData()
    }
  }, [user, sessionChecked])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchWeeklyData = async () => {
    try {
      console.log('Fetching weekly data for user:', user?.id)
      const stats = await PainLogService.getWeeklyStats(user!.id)
      console.log('Weekly stats received from service:', stats)
      
      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      // Initialize with 0 values for the last 7 days
      const dailyData: { [key: string]: number } = {}
      last7Days.forEach(day => {
        dailyData[day] = 0
      })

      console.log('Last 7 days array:', last7Days)
      console.log('Initial dailyData structure:', dailyData)

      // Calculate average pain level for each day
      Object.entries(stats).forEach(([day, painLevels]: [string, number[]]) => {
        console.log(`Processing day: "${day}", pain levels:`, painLevels)
        if (painLevels.length > 0) {
          const avgPain = Math.round(painLevels.reduce((a, b) => a + b, 0) / painLevels.length)
          console.log(`Setting dailyData["${day}"] = ${avgPain}`)
          dailyData[day] = avgPain
        }
      })

      console.log('Final daily data before state update:', dailyData)

      if (isMountedRef.current) {
        setWeeklyData(dailyData)
        console.log('State updated with weekly data')
      }
    } catch (error) {
      console.error('Error fetching weekly stats:', error)
      // Keep default 0 values
    }
  }

  if (!sessionChecked || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">autorenew</span>
          <p className="text-on-surface-variant">Loading your dashboard...</p>
        </div>
      </div>
    )
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
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden hover:opacity-80 transition-opacity"
              >
                <div className="w-full h-full bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
              </button>
              
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-high rounded-xl shadow-lg py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-on-surface hover:bg-surface-container-highest flex items-center gap-2 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span className="font-medium">Log out</span>
                  </button>
                </div>
              )}
            </div>
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
              {last7Days.map((day) => {
                const painLevel = weeklyData[day] || 0
                // Convert pain level (0-10) to height percentage (0-100%)
                const heightPercent = (painLevel / 10) * 100
                const dayAbbr = getDayAbbr(day)
                
                console.log(`Rendering bar for date "${day}": painLevel=${painLevel}, dayAbbr=${dayAbbr}`)
                
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
