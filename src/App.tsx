import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProductList from './components/ProductList'
import AdminPanel from './components/AdminPanel'
import Navbar from './components/Navbar'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 relative pb-8">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <div className="fixed bottom-2 right-4">
          <span className="text-xs text-gray-400">V 1.0.0</span>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App