import {
	getCategories,
	getDrops,
} from '@/lib/services/products-admin-fetcher'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage() {
	const [categories, drops] = await Promise.all([
		getCategories(),
		getDrops(),
	])

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Nuevo Producto</h1>
			<ProductForm categories={categories} drops={drops} />
		</div>
	)
}
