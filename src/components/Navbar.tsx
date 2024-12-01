import { Link } from 'react-router-dom'
import { ShoppingBag, Settings, Check, Edit2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const Navbar = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [siteName, setSiteName] = useState('Sipariş Sistemi')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load saved site name from localStorage
    const savedName = localStorage.getItem('siteName')
    if (savedName) {
      setSiteName(savedName)
    }
  }, [])

  const handleEditClick = () => {
    setIsEditing(true)
    // Focus the input field after it becomes visible
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleSave = () => {
    setIsEditing(false)
    localStorage.setItem('siteName', siteName)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      // Restore the previous value from localStorage
      const savedName = localStorage.getItem('siteName') || 'Sipariş Sistemi'
      setSiteName(savedName)
    }
  }

  return (
    <nav className="bg-blue-600 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-white" />
            <div className="flex items-center">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="font-semibold text-xl px-2 py-1 border rounded focus:outline-none focus:border-blue-300 bg-white text-blue-900"
                    maxLength={20}
                  />
                  <button
                    onClick={handleSave}
                    className="p-1 hover:bg-blue-500 rounded-full text-white"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xl text-white">{siteName}</span>
                  <button
                    onClick={handleEditClick}
                    className="p-1 hover:bg-blue-500 rounded-full text-blue-100 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </Link>
          <Link to="/admin" className="p-2 hover:bg-blue-500 rounded-full">
            <Settings className="h-6 w-6 text-white" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar