import { useState } from 'react'
import { Product, Order } from '../types'

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState('')
  const [instagramUsername, setInstagramUsername] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleOrder = () => {
    if (!selectedSize || !instagramUsername) {
      return
    }

    const order: Order = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      size: selectedSize,
      instagramUsername,
      orderDate: new Date().toISOString(),
    }

    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(order)
    localStorage.setItem('orders', JSON.stringify(orders))

    // Update stock
    const products = JSON.parse(localStorage.getItem('products') || '[]')
    const updatedProducts = products.map((p: Product) => {
      if (p.id === product.id) {
        return {
          ...p,
          sizes: p.sizes.map(s => {
            if (s.name === selectedSize) {
              return { ...s, stock: s.stock - 1 }
            }
            return s
          })
        }
      }
      return p
    })
    localStorage.setItem('products', JSON.stringify(updatedProducts))

    setShowSuccessMessage(true)
    setSelectedSize('')
    setInstagramUsername('')

    // Reload after message disappears
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <p className="text-lg font-bold text-gray-900 mb-4">
          {product.price.toLocaleString('tr-TR')} ₺
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Instagram Kullanıcı Adı:
            </label>
            <input
              type="text"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              placeholder="@kullaniciadi"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Beden Seçimi:</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size.name)}
                  disabled={size.stock === 0}
                  className={`px-3 py-1.5 rounded-lg border transition-colors
                    ${size.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                      selectedSize === size.name 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-gray-300 hover:border-blue-600'}`}
                >
                  {size.name} ({size.stock})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleOrder}
              disabled={!instagramUsername || !selectedSize}
              className={`w-full py-2 rounded-lg transition-colors
                ${(!instagramUsername || !selectedSize) 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Sipariş Ver
            </button>

            {showSuccessMessage && (
              <div className="animate-fade-in bg-green-50 text-green-800 px-4 py-2 rounded-lg border border-green-200 text-center">
                Siparişiniz başarıyla alınmıştır!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard