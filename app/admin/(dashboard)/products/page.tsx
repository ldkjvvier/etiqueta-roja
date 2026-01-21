import { Suspense } from 'react'
import { getAdminProducts } from '@/lib/services/products-admin'
import { ProductTable } from './products-client'
import { Button } from '@/components/ui/button'

// Types for searchParams (in Next.js 15 they might be promises, but in 14 they are objects.
// Assuming standard Next.js behavior for now. If build fails, we await it)

export default async function AdminProductsPage({
	searchParams,
}: {
	searchParams: Promise<{
		[key: string]: string | string[] | undefined
	}>
}) {
	const params = await searchParams
	const page = Number(params?.page) || 1
	const query = (params?.q as string) || ''
	const limit = 10

	const { products, totalCount, totalPages } = await getAdminProducts(
		{
			page,
			limit,
			query,
		},
	)

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-end">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Inventario
					</h1>
					<p className="text-muted-foreground">
						Gestiona tus productos, precios y stock disponible.
					</p>
				</div>
			</div>

			<Suspense
				fallback={
					<div className="p-8 text-center text-muted-foreground">
						Cargando inventario...
					</div>
				}
			>
				<ProductTable
					products={products}
					totalCount={totalCount}
					currentPage={page}
					totalPages={totalPages}
					search={query}
				/>
			</Suspense>
		</div>
	)
}
