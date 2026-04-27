import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { TriggerReliefService } from '../services/triggerReliefService'

// Helper function to convert Date to local YYYY-MM-DD string
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TriggersAndReliefs() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const isMountedRef = useRef(true)

  const [entryType, setEntryType] = useState<'trigger' | 'relief'>('trigger')
  const [description, setDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getLocalDateString(new Date())
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  // Track mount/unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, user, navigate])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">autorenew</span>
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!description.trim()) {
      alert('Please describe the trigger or relief')
      return
    }

    if (isMountedRef.current) {
      setIsLoading(true)
    }

    try {
      await TriggerReliefService.saveTriggerRelief(
        user!.id,
        entryType,
        description,
        selectedDate
      )

      // Show success
      if (isMountedRef.current) {
        setShowSuccessBanner(true)
        setDescription('')
        setIsLoading(false)

        setTimeout(() => setShowSuccessBanner(false), 3000)
      }
    } catch (err: any) {
      console.error('Error saving entry:', err)
      if (isMountedRef.current) {
        alert('Failed to save entry. Please try again.')
        setIsLoading(false)
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="fixed top-24 left-0 right-0 z-40 flex justify-center px-6">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-full shadow-xl flex items-center gap-3 font-semibold">
            <span className="material-symbols-outlined text-2xl flex-shrink-0">check_circle</span>
            <span>Entry saved successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(29,27,26,0.06)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity active:scale-95 font-semibold text-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="hidden md:inline">Back</span>
          </button>
          <h1 className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Triggers & Relief
          </h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* Brand Visual Anchor */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-sm border border-outline-variant/20">
            <img src="/triggers_&_reliefs.png" alt="Triggers and Reliefs" className="w-16 h-16 object-contain rounded-full" />
          </div>
        </div>

        {/* Date Selector */}
        <section className="mb-12 text-center">
          <label htmlFor="date-picker" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full border border-outline-variant/20 cursor-pointer hover:bg-surface-container transition-colors active:scale-95">
            <span className="material-symbols-outlined text-tertiary text-sm">calendar_today</span>
            <span className="text-sm font-medium text-on-surface-variant tracking-wide">{formatDate(selectedDate)}</span>
          </label>
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="hidden"
          />
        </section>

        {/* Form Canvas */}
        <div className="space-y-8">
          {/* Type Selector (Segmented Control) */}
          <section>
            <label className="block text-[11px] font-medium tracking-[0.1em] uppercase text-on-surface-variant mb-4 px-1">
              Entry Type
            </label>
            <div className="bg-surface-container-high p-1.5 rounded-full flex gap-1">
              <button
                onClick={() => setEntryType('trigger')}
                disabled={isLoading}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                  entryType === 'trigger'
                    ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                Trigger
              </button>
              <button
                onClick={() => setEntryType('relief')}
                disabled={isLoading}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                  entryType === 'relief'
                    ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-sm">spa</span>
                Relief
              </button>
            </div>
          </section>

          {/* Description Input */}
          <section>
            <div className="flex justify-between items-center mb-4 px-1">
              <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-on-surface-variant">
                Description
              </label>
              <span className="material-symbols-outlined text-outline text-lg">edit_note</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`e.g. ${
                entryType === 'trigger'
                  ? 'Stress at work, poor sleep, weather change...'
                  : 'Stretching helped, medication reduced pain, warm bath...'
              }`}
              className="w-full bg-surface-container-lowest text-on-surface rounded-3xl p-6 focus:ring-2 focus:ring-primary/20 border border-outline-variant/20 text-base leading-relaxed placeholder:text-outline-variant transition-all outline-none resize-none disabled:opacity-50"
              rows={6}
              disabled={isLoading}
            />
          </section>
        </div>
      </main>

      {/* Save Button */}
      <section className="fixed bottom-0 left-0 w-full px-6 pb-10 pt-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={isLoading || !description.trim()}
            className="w-full py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">autorenew</span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save Entry</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-tertiary-fixed blur-[100px] rounded-full opacity-50"></div>
      </div>
    </div>
  )
}
