import { useState, useEffect, useRef } from 'react'

interface BodySelectorProps {
  selectedParts: string[]
  onChange: (parts: string[]) => void
  disabled?: boolean
}

export default function BodySelector({ selectedParts, onChange, disabled = false }: BodySelectorProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)

  // Load SVG on mount
  useEffect(() => {
    const loadSVG = async () => {
      try {
        const response = await fetch('/front-side-human-body.svg')
        if (!response.ok) {
          throw new Error('Failed to load SVG')
        }
        const content = await response.text()
        setSvgContent(content)
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading body SVG:', err)
        setError('Failed to load body selector')
        setIsLoading(false)
      }
    }

    loadSVG()
  }, [])

  // Handle path clicks
  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return

    const paths = svgContainerRef.current.querySelectorAll('path[id]')

    const handlePathClick = (e: Event) => {
      if (disabled) return

      const path = e.currentTarget as SVGPathElement
      const pathId = path.id

      if (pathId) {
        onChange(
          selectedParts.includes(pathId)
            ? selectedParts.filter(p => p !== pathId)
            : [...selectedParts, pathId]
        )
      }
    }

    paths.forEach(path => {
      const svgPath = path as SVGPathElement
      svgPath.addEventListener('click', handlePathClick)
      svgPath.style.cursor = disabled ? 'default' : 'pointer'
    })

    return () => {
      paths.forEach(path => {
        (path as SVGPathElement).removeEventListener('click', handlePathClick)
      })
    }
  }, [svgContent, selectedParts, onChange, disabled])

  // Update SVG styling based on selection
  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return

    const paths = svgContainerRef.current.querySelectorAll('path[id]')

    paths.forEach(path => {
      const pathId = (path as SVGPathElement).id
      const isSelected = selectedParts.includes(pathId)

      if (isSelected) {
        // Selected state - higher opacity (visible)
        path.setAttribute('style', 'fill:#000000;fill-opacity:0.406393;stroke-width:0.264583')
      } else {
        // Unselected state - lower opacity (subtle)
        path.setAttribute('style', 'fill:#000000;fill-opacity:0.046393;stroke-width:0.264583')
      }
    })
  }, [selectedParts, svgContent])

  if (isLoading) {
    return (
      <section className="mb-12">
        <label className="block text-[11px] font-medium tracking-[0.1em] uppercase text-on-surface-variant mb-4 px-1">
          Select Pain Areas (Optional)
        </label>
        <div className="flex items-center justify-center h-80 bg-surface-container-low rounded-2xl border border-outline-variant/20">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">autorenew</span>
            <p className="text-sm text-on-surface-variant">Loading body map...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-12">
        <label className="block text-[11px] font-medium tracking-[0.1em] uppercase text-on-surface-variant mb-4 px-1">
          Select Pain Areas (Optional)
        </label>
        <div className="flex items-center justify-center h-80 bg-surface-container-low rounded-2xl border border-outline-variant/20">
          <p className="text-sm text-error">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <label className="block text-[11px] font-medium tracking-[0.1em] uppercase text-on-surface-variant mb-4 px-1">
        Select Pain Areas (Optional)
      </label>

      {/* SVG Container */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 overflow-hidden">
        <div
          ref={svgContainerRef}
          className="body-selector-svg flex justify-center"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{
            opacity: disabled ? 0.6 : 1,
            transition: 'opacity 0.2s ease'
          }}
        />
      </div>

      {/* Selected Parts Chips */}
      {selectedParts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedParts.map(part => (
            <div
              key={part}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold"
            >
              <span>
                {part
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </span>
              {!disabled && (
                <button
                  onClick={() => onChange(selectedParts.filter(p => p !== part))}
                  className="ml-1 hover:text-red-900 transition-colors"
                  aria-label={`Remove ${part}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Styles for SVG interactivity */}
      <style>{`
        .body-selector-svg svg {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
        }

        .body-selector-svg path {
          transition: all 0.2s ease;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .body-selector-svg path[id]:hover {
          filter: brightness(0.9);
          stroke-width: 2;
        }
      `}</style>
    </section>
  )
}
