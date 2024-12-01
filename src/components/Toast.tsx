import { Check, X } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

const Toast = ({ message, type = 'success', onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
        ${type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
          'bg-red-100 text-red-800 border border-red-200'}`}>
        <div className="flex items-center gap-2">
          {type === 'success' ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <X className="h-5 w-5 text-red-500" />
          )}
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default Toast