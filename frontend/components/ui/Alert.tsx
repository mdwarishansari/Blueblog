"use client"
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
}

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
}: AlertProps) {
  const alertStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: FiCheckCircle,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: FiXCircle,
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: FiAlertCircle,
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: FiInfo,
      iconColor: 'text-blue-600',
    },
  }

  const { bg, border, text, icon: Icon, iconColor } = alertStyles[type]

  return (
    <div className={`${bg} border ${border} rounded-lg p-4 ${text}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={`text-sm ${title ? 'mt-1' : ''}`}>
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex ${text} hover:opacity-75 focus:outline-none`}
            >
              <span className="sr-only">Close</span>
              <FiXCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}