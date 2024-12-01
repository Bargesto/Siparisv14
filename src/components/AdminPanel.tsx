import { useState, useEffect, useRef } from 'react'
import { Product, Order } from '../types'
import { Download, Plus, Trash, Edit, X, Users, Image as ImageIcon } from 'lucide-react'
import * as XLSX from 'xlsx'
import OrderList from './OrderList'

const AdminPanel = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [newProduct, setNewProduct] = useState<Product>({
    id: '',
    name: '',
    image: '',
    price: 0,
    sizes: [{ name: '', stock: 0 }]
  })

  // Refs for file inputs
  const newImageInputRef = useRef<HTMLInputElement>(null)
  const editImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const storedProducts = localStorage.getItem('products')
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    } else {
      // Add sample products if none exist
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Lacoste Kazak',
          image: 'https://akn-lacoste.a-cdn.akinoncloud.com/products/2023/01/11/194265/028d4453-1529-4377-bcec-0e329c8735af_size2000x2000_cropCenter.jpg',
          price: 199.99,
          sizes: [
            { name: 'S', stock: 10 },
            { name: 'M', stock: 15 },
            { name: 'L', stock: 12 }
          ]
        },
        {
          id: '2',
          name: 'Kot Pantolon',
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
          price: 299.99,
          sizes: [
            { name: '28', stock: 8 },
            { name: '30', stock: 12 },
            { name: '32', stock: 10 }
          ]
        },
        {
          id: '3',
          name: 'TNF Pantolon',
          image: 'https://media.karousell.com/media/photos/products/2024/2/23/_tnf_the_north_face_l5xl_windp_1708691420_f2228d16_progressive.jpg',
          price: 750,
          sizes: [
            { name: 'S', stock: 5 },
            { name: 'M', stock: 8 },
            { name: 'L', stock: 6 },
            { name: 'XL', stock: 4 }
          ]
        }
      ]
      localStorage.setItem('products', JSON.stringify(sampleProducts))
      setProducts(sampleProducts)
    }
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Görsel boyutu 5MB\'dan küçük olmalıdır.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      if (target === 'new') {
        setNewProduct(prev => ({ ...prev, image: base64String }))
      } else if (editingProduct) {
        setEditingProduct(prev => prev ? ({ ...prev, image: base64String }) : null)
      }
    }
    reader.readAsDataURL(file)
  }

  // Rest of the existing functions...
  const setExcelColumnWidths = (ws: XLSX.WorkSheet) => {
    const columnWidths = [
      { wch: 25 },  // A - Instagram Username
      { wch: 35 },  // B - Product Name
      { wch: 15 },  // C - Size
      { wch: 15 },  // D - Price
      { wch: 20 }   // E - Order Date
    ]
    ws['!cols'] = columnWidths
  }

  const exportOrders = () => {
    const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]')
    
    const exportData = orders.map(order => {
      const product = products.find(p => p.id === order.productId)
      return {
        'Instagram Kullanıcı Adı': order.instagramUsername,
        'Ürün Adı': order.productName,
        'Beden': order.size,
        'Fiyat': product ? `${product.price.toLocaleString('tr-TR')} ₺` : 'N/A',
        'Sipariş Tarihi': order.orderDate
      }
    })
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    setExcelColumnWidths(ws)
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Siparişler')
    XLSX.writeFile(wb, 'siparisler.xlsx')
  }

  const exportProductOrders = (productId: string, productName: string) => {
    const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]')
    const productOrders = orders.filter(order => order.productId === productId)
    
    if (productOrders.length === 0) {
      alert('Bu ürün için henüz sipariş bulunmamaktadır.')
      return
    }

    const product = products.find(p => p.id === productId)

    const exportData = productOrders.map(order => ({
      'Instagram Kullanıcı Adı': order.instagramUsername,
      'Ürün Adı': order.productName,
      'Beden': order.size,
      'Fiyat': product ? `${product.price.toLocaleString('tr-TR')} ₺` : 'N/A',
      'Sipariş Tarihi': order.orderDate
    }))
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    setExcelColumnWidths(ws)
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ürün Siparişleri')
    XLSX.writeFile(wb, `${productName}-siparisleri.xlsx`)
  }

  const exportUserStats = () => {
    const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]')
    
    const userStats = orders.reduce((acc: { [key: string]: { orderCount: number, totalSpent: number } }, order) => {
      if (!acc[order.instagramUsername]) {
        acc[order.instagramUsername] = { orderCount: 0, totalSpent: 0 }
      }
      
      const product = products.find(p => p.id === order.productId)
      const orderAmount = product ? product.price : 0
      
      acc[order.instagramUsername].orderCount += 1
      acc[order.instagramUsername].totalSpent += orderAmount
      
      return acc
    }, {})

    const userStatsArray = Object.entries(userStats).map(([username, stats]) => ({
      'Instagram Kullanıcı Adı': username,
      'Toplam Sipariş Sayısı': stats.orderCount,
      'Toplam Harcama': `${stats.totalSpent.toLocaleString('tr-TR')} ₺`
    }))

    const ws = XLSX.utils.json_to_sheet(userStatsArray)
    
    ws['!cols'] = [
      { wch: 30 },  // Instagram username
      { wch: 20 },  // Order count
      { wch: 20 }   // Total spent
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Müşteri Bazlı Rapor')
    XLSX.writeFile(wb, 'musteri-bazli-rapor.xlsx')
  }

  const handleDelete = (productId: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      const updatedProducts = products.filter(p => p.id !== productId)
      localStorage.setItem('products', JSON.stringify(updatedProducts))
      setProducts(updatedProducts)
    }
  }

  const handleAddSize = (target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewProduct({
        ...newProduct,
        sizes: [...newProduct.sizes, { name: '', stock: 0 }]
      })
    } else if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        sizes: [...editingProduct.sizes, { name: '', stock: 0 }]
      })
    }
  }

  const handleRemoveSize = (index: number, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewProduct({
        ...newProduct,
        sizes: newProduct.sizes.filter((_, i) => i !== index)
      })
    } else if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        sizes: editingProduct.sizes.filter((_, i) => i !== index)
      })
    }
  }

  const handleSizeChange = (index: number, field: 'name' | 'stock', value: string | number, target: 'new' | 'edit') => {
    if (target === 'new') {
      const updatedSizes = newProduct.sizes.map((size, i) => {
        if (i === index) {
          return { ...size, [field]: value }
        }
        return size
      })
      setNewProduct({ ...newProduct, sizes: updatedSizes })
    } else if (editingProduct) {
      const updatedSizes = editingProduct.sizes.map((size, i) => {
        if (i === index) {
          return { ...size, [field]: value }
        }
        return size
      })
      setEditingProduct({ ...editingProduct, sizes: updatedSizes })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const productToSave = {
      ...newProduct,
      id: Date.now().toString()
    }
    const updatedProducts = [...products, productToSave]
    localStorage.setItem('products', JSON.stringify(updatedProducts))
    setProducts(updatedProducts)
    setNewProduct({
      id: '',
      name: '',
      image: '',
      price: 0,
      sizes: [{ name: '', stock: 0 }]
    })
    setShowNewProductForm(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    const updatedProducts = products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    )
    localStorage.setItem('products', JSON.stringify(updatedProducts))
    setProducts(updatedProducts)
    setEditingProduct(null)
  }

  const getProductOrderCount = (productId: string) => {
    const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]')
    return orders.filter(order => order.productId === productId).length
  }

  const getStatistics = () => {
    const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]')
    const uniqueUsers = new Set(orders.map(order => order.instagramUsername))
    
    const totalRevenue = orders.reduce((sum, order) => {
      const product = products.find(p => p.id === order.productId)
      return sum + (product?.price || 0)
    }, 0)

    return {
      totalOrders: orders.length,
      totalRevenue,
      uniqueUsers: uniqueUsers.size
    }
  }

  const stats = getStatistics()

  const renderImageInput = (target: 'new' | 'edit') => {
    const currentImage = target === 'new' ? newProduct.image : editingProduct?.image
    const inputRef = target === 'new' ? newImageInputRef : editImageInputRef

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Ürün Görseli
        </label>
        <div className="space-y-2">
          <input
            type="url"
            value={currentImage}
            onChange={(e) => {
              if (target === 'new') {
                setNewProduct({ ...newProduct, image: e.target.value })
              } else if (editingProduct) {
                setEditingProduct({ ...editingProduct, image: e.target.value })
              }
            }}
            placeholder="Görsel URL'si"
            className="w-full border rounded-lg p-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">veya</span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <ImageIcon size={20} />
              Bilgisayardan Seç
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, target)}
            className="hidden"
          />
          {currentImage && (
            <div className="mt-2">
              <img
                src={currentImage}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewProductForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Yeni Ürün Ekle
          </button>
          <button
            onClick={exportUserStats}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Users size={20} />
            Müşteri Bazlı Rapor
          </button>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            Tüm Siparişleri İndir
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Genel İstatistikler</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600 mb-1">Toplam Sipariş</h3>
            <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600 mb-1">Toplam Gelir</h3>
            <p className="text-2xl font-bold text-green-900">{stats.totalRevenue.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600 mb-1">Tekil Müşteri</h3>
            <p className="text-2xl font-bold text-purple-900">{stats.uniqueUsers}</p>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Mevcut Ürünler</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-gray-600">{product.price.toLocaleString('tr-TR')} ₺</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Toplam Sipariş: {getProductOrderCount(product.id)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit size={18} />
                    Düzenle
                  </button>
                  <button
                    onClick={() => exportProductOrders(product.id, product.name)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700"
                  >
                    <Download size={18} />
                    Siparişleri İndir
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash size={18} />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <OrderList />

      {/* New Product Modal */}
      {showNewProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Yeni Ürün Ekle</h2>
              <button
                onClick={() => setShowNewProductForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>

              {renderImageInput('new')}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="w-full border rounded-lg p-2"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedenler ve Stok
                </label>
                {newProduct.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={size.name}
                      onChange={(e) => handleSizeChange(index, 'name', e.target.value, 'new')}
                      placeholder="Beden"
                      className="flex-1 border rounded-lg p-2"
                      required
                    />
                    <input
                      type="number"
                      value={size.stock}
                      onChange={(e) => handleSizeChange(index, 'stock', Number(e.target.value), 'new')}
                      placeholder="Stok"
                      className="flex-1 border rounded-lg p-2"
                      required
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index, 'new')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSize('new')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus size={20} />
                  Beden Ekle
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Ürünü Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProductForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ürün Düzenle</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>

              {renderImageInput('edit')}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat
                </label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full border rounded-lg p-2"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedenler ve Stok
                </label>
                {editingProduct.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={size.name}
                      onChange={(e) => handleSizeChange(index, 'name', e.target.value, 'edit')}
                      placeholder="Beden"
                      className="flex-1 border rounded-lg p-2"
                      required
                    />
                    <input
                      type="number"
                      value={size.stock}
                      onChange={(e) => handleSizeChange(index, 'stock', Number(e.target.value), 'edit')}
                      placeholder="Stok"
                      className="flex-1 border rounded-lg p-2"
                      required
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index, 'edit')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSize('edit')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus size={20} />
                  Beden Ekle
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Değişiklikleri Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel