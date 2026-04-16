import React from 'react'

interface CardProps {
  onClick?: () => void
  icon?: string
  title: string
  description: string
  variant?: 'default' | 'hero' | 'disabled'
  className?: string
  children?: React.ReactNode
  isClickable?: boolean
}

export default function Card({
  onClick,
  icon,
  title,
  description,
  variant = 'default',
  className = '',
  children,
  isClickable = true
}: CardProps) {
  const variants = {
    default: 'bg-surface-container-lowest border border-outline-variant/20 shadow-sm hover:shadow-md',
    hero: 'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20',
    disabled: 'opacity-50 bg-surface-container-high border border-dashed border-outline-variant/30 grayscale'
  }

  return (
    <div
      onClick={onClick}
      className={`
        rounded-[1.5rem] p-6 cursor-pointer transition-all duration-200
        ${isClickable && variant !== 'disabled' ? 'active:scale-95 hover:shadow-lg' : ''}
        ${variants[variant]}
        ${className}
      `}
    >
      {children ? (
        children
      ) : (
        <div className="flex flex-col gap-4">
          {icon && (
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm opacity-90 leading-relaxed">{description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
