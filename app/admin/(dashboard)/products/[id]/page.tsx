import {
	getCategories,
	getDrops,
	getProductById,
} from '@/lib/services/products-admin'
import { ProductForm } from '@/components/admin/product-form'
import { notFound } from 'next/navigation'

// We define params as a Promise for compatibility with latest Next.js types
export default async function ProductPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const [product, categories, drops] = await Promise.all([
		getProductById(id),
		getCategories(),
		getDrops(),
	])

	if (!product) {
		notFound()
	}

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Editar Producto</h1>
			<ProductForm
				categories={categories}
				drops={drops}
				initialData={product}
			/>
		</div>
	)
}
