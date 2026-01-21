import { getCategories } from '@/lib/services/categories-server'
import { CategoriesClient } from '@/components/admin/categories-client'

export default async function CategoriesPage() {
	const categories = await getCategories()

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<CategoriesClient data={categories} />
		</div>
	)
}
