import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-8 py-12 md:py-24 max-w-md mx-auto relative overflow-hidden bg-background text-on-surface">
      {/* Ambient Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-tertiary/5 rounded-full blur-[80px] -z-10"></div>

      {/* Branding Section */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full">
        {/* Phoenix Logo Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-lg">
            {/* Chronicae Phoenix Logo */}
            <img 
              src="/logo-chronicae.png"
              alt="Chronicae Phoenix Logo"
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Chronicae
          </h1>
          <div className="space-y-1">
            <p className="text-xl font-body text-on-surface font-medium">
              Understand your symptoms.
            </p>
            <p className="text-xl font-body text-on-surface-variant opacity-80">
              Take control.
            </p>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="w-full space-y-6 mt-12">
        {/* Primary CTA */}
        <button 
          onClick={() => navigate('/signup')}
          className="w-full py-5 px-8 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-lg shadow-[0_8px_24px_rgba(172,45,0,0.25)] active:scale-95 transition-all duration-200 hover:shadow-[0_12px_32px_rgba(172,45,0,0.3)]"
        >
          Get Started
        </button>

        {/* Secondary CTA */}
        <button 
          onClick={() => navigate('/login')}
          className="w-full py-4 px-8 rounded-full border border-outline-variant/30 text-on-surface-variant font-headline font-semibold text-base hover:bg-surface-container-low transition-colors active:scale-95 duration-200"
        >
          Log in
        </button>

        {/* Trust Indicator / Value Note */}
        <div className="pt-8 text-center flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <span className="font-label text-xs uppercase tracking-[0.1em]">Privacy First Health Tracking</span>
          </div>
          <p className="font-body text-[13px] text-on-surface-variant/50 leading-relaxed px-4">
            Join thousands of people reclaiming their daily rhythm through mindful observation.
          </p>
        </div>
      </div>

      {/* Minimal Footer Indicator */}
      <div className="fixed bottom-6 left-0 right-0 text-center md:hidden pointer-events-none">
        <div className="w-12 h-1 bg-surface-container-highest rounded-full mx-auto opacity-20"></div>
      </div>
    </main>
  )
}
