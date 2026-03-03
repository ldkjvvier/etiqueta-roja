import { getCategories } from '@/lib/services/categories-server'
import { CategoriesClient } from '@/components/admin/categories-client'

export default async function CategoriesPage() {
	const categories = await getCategories()

	return (
		<div className="space-y-6">
			<CategoriesClient data={categories} />
		</div>
	)
}
