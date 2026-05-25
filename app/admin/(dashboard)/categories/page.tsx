import { getCategories } from '@/lib/data/categories'
import { CategoriesClient } from '@/components/admin/categories-client'

export default async function CategoriesPage() {
	const { data: categories } = await getCategories()

	return (
		<div className="space-y-6">
			<CategoriesClient data={categories ?? []} />
		</div>
	)
}
