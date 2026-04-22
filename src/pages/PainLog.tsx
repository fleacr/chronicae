import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PainLogService } from '../services/painLogService'
import Button from '../components/Button'

export default function PainLog() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const isMountedRef = useRef(true)
  const [painLevel, setPainLevel] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const painTags = ['Sharp', 'Dull Ache', 'Throbbing', 'Radiating', 'Burning', 'Tingling', 'Numbness', 'Cramping']

  // Track mount/unmount to prevent setState after unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Redirect to login if not authenticated - use useEffect to prevent render-time navigation
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSave = async () => {
    console.log('handleSave called - User:', user?.id, 'Pain Level:', painLevel)
    
    if (!user) {
      console.error('No user')
      if (isMountedRef.current) setError('User not authenticated')
      return
    }

    if (painLevel === null) {
      console.error('No pain level selected')
      if (isMountedRef.current) setError('Please select a pain level')
      return
    }

    console.log('Starting save...')
    if (isMountedRef.current) {
      setIsLoading(true)
      setError(null)
    }

    try {
      console.log('Calling savePainLog with data:', {
        userId: user.id,
        pain_level: painLevel,
        description,
        tags: selectedTags
      })

      const result = await PainLogService.savePainLog(user.id, {
        pain_level: painLevel,
        description,
        tags: selectedTags
      })

      console.log('Save result:', result)

      if (!result) {
        throw new Error('Failed to save entry - no result returned')
      }

      console.log('Save successful, isMountedRef.current:', isMountedRef.current)
      
      // Reset form regardless of mount status
      setPainLevel(null)
      setDescription('')
      setSelectedTags([])
      
      console.log('Form reset, about to navigate')
      
      // Navigate - don't check isMounted for this critical action
      setTimeout(() => {
        console.log('Navigating to /home now')
        navigate('/home', { 
          state: { message: 'Pain entry saved successfully!' }
        })
      }, 100)
    } catch (err: any) {
      console.error('Error saving pain log:', err)
      if (isMountedRef.current) {
        const errorMsg = err?.message || 'Failed to save entry. Please try again.'
        console.log('Setting error:', errorMsg)
        setError(errorMsg)
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
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
            Pain Log
          </h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* Hero Question */}
        <section className="mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface leading-tight mb-3">
            How is your pain today?
          </h2>
          <p className="text-on-surface-variant/80 font-medium text-lg">
            Tracking your sensation helps identify patterns over time.
          </p>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-error-container text-on-error-container text-sm flex gap-2 items-start">
            <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
            <p>{error}</p>
          </div>
        )}

        {/* Pain Level Selector */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-4 px-1">
            <span className="text-sm font-semibold tracking-widest text-on-surface-variant uppercase">Minimal</span>
            <span className="text-sm font-semibold tracking-widest text-on-surface-variant uppercase">Extreme</span>
          </div>

          {/* Pain Scale Grid */}
          <div className="grid grid-cols-5 gap-2 md:grid-cols-10 md:gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
              <button
                key={level}
                onClick={() => setPainLevel(level)}
                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-lg active:scale-90 transition-all duration-200 ${
                  painLevel === level
                    ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 ring-4 ring-primary-fixed'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Gradient Reference Track */}
          <div className="mt-6 h-2 w-full rounded-full bg-gradient-to-r from-primary-fixed via-primary to-primary-container opacity-40"></div>
        </section>

        {/* Description Input */}
        <section className="mb-12">
          <label className="block text-sm font-bold tracking-wider text-on-surface-variant uppercase mb-4 px-1">
            Describe the sensation
          </label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Headache, hip pain, full body discomfort, morning stiffness..."
              className="w-full bg-surface-container-low border-none rounded-3xl p-6 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed transition-all duration-300 resize-none"
              rows={5}
              disabled={isLoading}
            />
            <div className="absolute bottom-4 right-6 text-on-surface-variant/30 pointer-events-none">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
          </div>
        </section>

        {/* Quick Tags */}
        <section className="mb-12">
          <p className="text-xs font-bold tracking-widest text-on-surface-variant/50 uppercase mb-4 px-1">
            Quick Tags (Optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {painTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                  selectedTags.includes(tag)
                    ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed hover:text-on-primary-fixed'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Summary Card */}
        {painLevel !== null && (
          <section className="mb-12 bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">Entry Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Pain Level</span>
                <span className="text-2xl font-bold text-primary">{painLevel}</span>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant">Tags</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {selectedTags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-primary-fixed text-primary rounded-full text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {description && (
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant">Description</span>
                  <span className="text-right text-on-surface max-w-[50%] text-sm">{description.substring(0, 50)}...</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Save Button */}
        <section className="fixed bottom-0 left-0 w-full px-6 pb-10 pt-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              disabled={painLevel === null}
              size="lg"
            >
              <span>Save Entry</span>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                done_all
              </span>
            </Button>
          </div>
        </section>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-tertiary-fixed blur-[100px] rounded-full opacity-50"></div>
      </div>
    </div>
  )
}
