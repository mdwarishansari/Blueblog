"use client"
import { FiAlertCircle } from 'react-icons/fi'

interface ErrorProps {
  message: string
  onRetry?: () => void
  className?: string
}

export default function Error({ message, onRetry, className = '' }: ErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <FiAlertCircle size={32} className="text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div className="flex items-center gap-2">
        <FiAlertCircle size={18} />
        <span>{message}</span>
      </div>
    </div>
  )
}