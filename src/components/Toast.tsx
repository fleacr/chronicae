import { useEffect, useState } from 'react'

export interface ToastProps {
  isVisible: boolean
  message: string
  type: 'success' | 'error'
  duration?: number
  onClose?: () => void
}

export default function Toast({
  isVisible,
  message,
  type,
  duration = 3000,
  onClose
}: ToastProps) {
  const [show, setShow] = useState(isVisible)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      setIsExiting(false)

      const timer = setTimeout(() => {
        setIsExiting(true)
        const exitTimer = setTimeout(() => {
          setShow(false)
          onClose?.()
        }, 300)
        return () => clearTimeout(exitTimer)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!show) return null

  const isSuccess = type === 'success'
  const bgColor = isSuccess
    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    : 'bg-gradient-to-r from-red-500 to-red-600'
  const icon = isSuccess ? 'check_circle' : 'error'

  return (
    <div
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-sm max-w-sm`}>
        <span className="material-symbols-outlined text-xl flex-shrink-0">{icon}</span>
        <p className="font-medium text-sm">{message}</p>
      </div>
    </div>
  )
}
