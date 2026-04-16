import React from 'react'

interface ButtonProps {
  onClick?: () => void
  disabled?: boolean
  isLoading?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Button({
  onClick,
  disabled = false,
  isLoading = false,
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:opacity-90',
    secondary: 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low',
    tertiary: 'bg-surface-container text-on-surface hover:bg-surface-container-high'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'w-full py-4 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {isLoading && <span className="material-symbols-outlined animate-spin">autorenew</span>}
      {children}
    </button>
  )
}
