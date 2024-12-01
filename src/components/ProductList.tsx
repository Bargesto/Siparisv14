import { useState, useEffect } from 'react'
import { Product } from '../types'
import ProductCard from './ProductCard'

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const storedProducts = localStorage.getItem('products')
    if (storedProducts) {
      // Show all products instead of just the first 3
      setProducts(JSON.parse(storedProducts))
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ürünlerimiz</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default ProductList