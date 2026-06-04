import { getProducts } from '@/lib/services/products-server'
import { ProductGrid } from './product-grid'

interface Props {
	searchParams: Promise<{ page?: string }>
}

export async function ProductGridSection({ searchParams }: Props) {
	const { page: pageStr } = await searchParams
	const page = Math.max(1, Number(pageStr) || 1)

	const { products, totalCount, totalPages } = await getProducts({ page })

	return (
		<ProductGrid
			products={products}
			currentPage={page}
			totalPages={totalPages}
			totalCount={totalCount}
		/>
	)
}
