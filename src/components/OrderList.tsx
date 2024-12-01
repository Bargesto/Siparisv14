import { useState, useEffect, useRef } from 'react'
import { Order, Product } from '../types'
import { ChevronUp, ChevronDown, Camera } from 'lucide-react'
import * as htmlToImage from 'html-to-image'
import { saveAs } from 'file-saver'

type SortField = 'orderDate' | 'instagramUsername' | 'productName' | 'size' | 'price'
type SortDirection = 'asc' | 'desc'

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [sortField, setSortField] = useState<SortField>('orderDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isCapturing, setIsCapturing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load orders and products from localStorage
    const storedOrders = localStorage.getItem('orders')
    const storedProducts = localStorage.getItem('products')
    
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders)
      setOrders(parsedOrders)
    }
    
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    }
  }, [])

  const getOrderPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId)
    return product?.price || 0
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const groupOrdersByUser = () => {
    const grouped: { [key: string]: Order[] } = {}
    const sortedOrders = getSortedOrders() // Now using getSortedOrders
    
    sortedOrders.forEach(order => {
      if (!grouped[order.instagramUsername]) {
        grouped[order.instagramUsername] = []
      }
      grouped[order.instagramUsername].push(order)
    })
    return grouped
  }

  const getSortedOrders = () => {
    return [...orders].sort((a, b) => {
      let compareValue: number = 0
      
      switch (sortField) {
        case 'orderDate':
          compareValue = new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          break
        case 'instagramUsername':
          compareValue = a.instagramUsername.localeCompare(b.instagramUsername)
          break
        case 'productName':
          compareValue = a.productName.localeCompare(b.productName)
          break
        case 'size':
          compareValue = a.size.localeCompare(b.size)
          break
        case 'price':
          compareValue = getOrderPrice(a.productId) - getOrderPrice(b.productId)
          break
      }

      return sortDirection === 'asc' ? compareValue : -compareValue
    })
  }

  const getUserTotal = (userOrders: Order[]): number => {
    return userOrders.reduce((total, order) => {
      return total + getOrderPrice(order.productId)
    }, 0)
  }

  const captureScreenshot = async (element: HTMLElement | null, username: string) => {
    if (!element) return

    try {
      // Add temporary capture styles
      element.style.backgroundColor = 'white'
      element.style.padding = '20px'
      
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      })
      
      // Remove temporary capture styles
      element.style.backgroundColor = ''
      element.style.padding = ''
      
      // Remove @ from username for filename
      const cleanUsername = username.replace('@', '')
      saveAs(dataUrl, `${cleanUsername}-siparisleri.png`)
    } catch (error) {
      console.error(`Error capturing screenshot for ${username}:`, error)
    }
  }

  const captureAllScreenshots = async () => {
    setIsCapturing(true)
    const groupedOrders = groupOrdersByUser()
    
    for (const [username, _] of Object.entries(groupedOrders)) {
      const element = document.getElementById(`order-group-${username}`)
      await captureScreenshot(element, username)
    }
    
    setIsCapturing(false)
  }

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null

    return sortDirection === 'asc' ? 
      <ChevronUp className="inline h-4 w-4" /> : 
      <ChevronDown className="inline h-4 w-4" />
  }

  const renderHeaderCell = (field: SortField, label: string) => (
    <th 
      onClick={() => handleSort(field)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIndicator field={field} />
      </div>
    </th>
  )

  const renderOrdersTable = (userOrders: Order[]) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {renderHeaderCell('orderDate', 'Sipariş Tarihi')}
          {renderHeaderCell('productName', 'Ürün')}
          {renderHeaderCell('size', 'Beden')}
          {renderHeaderCell('price', 'Fiyat')}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {userOrders.map((order) => (
          <tr key={order.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {formatDate(order.orderDate)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {order.productName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {order.size}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {getOrderPrice(order.productId).toLocaleString('tr-TR')} ₺
            </td>
          </tr>
        ))}
        <tr className="bg-gray-50 font-semibold">
          <td colSpan={3} className="px-6 py-4 text-right">
            Toplam:
          </td>
          <td className="px-6 py-4">
            {getUserTotal(userOrders).toLocaleString('tr-TR')} ₺
          </td>
        </tr>
      </tbody>
    </table>
  )

  if (orders.length === 0) {
    return null
  }

  const groupedOrders = groupOrdersByUser()

  return (
    <div className="mt-12" ref={containerRef}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Son Siparişler</h2>
        <button
          onClick={captureAllScreenshots}
          disabled={isCapturing}
          className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Camera size={20} />
          {isCapturing ? 'İşleniyor...' : 'Ekran Görüntüsü Al'}
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedOrders).map(([username, userOrders]) => (
          <div
            key={username}
            id={`order-group-${username}`}
            className="bg-white rounded-lg shadow-md overflow-hidden print:shadow-none"
          >
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h3 className="font-semibold text-lg">@{username}</h3>
              <p className="text-sm text-gray-500">
                Toplam {userOrders.length} sipariş
              </p>
            </div>
            <div className="overflow-x-auto">
              {renderOrdersTable(userOrders)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderList