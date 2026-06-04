import { getProducts } from '@/lib/services/products-server'
import { ProductGrid } from './product-grid'

export async function ProductGridSection() {
	const products = await getProducts()
	return <ProductGrid products={products} />
}
