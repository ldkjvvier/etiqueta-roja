import { getProducts } from '@/lib/services/products-server'
import { getCategories } from '@/lib/data/categories'
import { ProductGrid } from './product-grid'

interface Props {
	searchParams: Promise<{ page?: string; q?: string }>
}

export async function ProductGridSection({ searchParams }: Props) {
	const { page: pageStr, q = '' } = await searchParams
	const page = Math.max(1, Number(pageStr) || 1)

	const [{ products, totalCount, totalPages }, categoriesResult] =
		await Promise.all([getProducts({ page, q }), getCategories()])

	const allCategories = (categoriesResult.data ?? []).map((c) => c.name)

	return (
		<ProductGrid
			products={products}
			currentPage={page}
			totalPages={totalPages}
			totalCount={totalCount}
			searchQuery={q}
			allCategories={allCategories}
		/>
	)
}
