import {
	getProducts,
	PRODUCTS_PAGE_SIZE,
} from '@/lib/services/products-server'
import { ProductGrid } from './product-grid'

export async function ProductGridSection() {
	// Primer lote renderizado en el servidor: LCP y SEO intactos.
	// El resto se carga progresivamente en el cliente (infinite scroll).
	const { products, totalCount } = await getProducts({
		page: 1,
		pageSize: PRODUCTS_PAGE_SIZE,
	})

	return (
		<ProductGrid
			initialProducts={products}
			totalCount={totalCount}
			pageSize={PRODUCTS_PAGE_SIZE}
		/>
	)
}
