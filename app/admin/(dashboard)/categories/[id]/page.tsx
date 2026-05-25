import { notFound } from 'next/navigation'
import { getCategoryById } from '@/lib/data/categories'
import { CategoryForm } from '@/components/admin/category-form'

interface PageProps {
	params: Promise<{ id: string }>
}

export default async function EditCategoryPage({
	params,
}: PageProps) {
	const { id } = await params
	const { data: category } = await getCategoryById(id)

	if (!category) {
		notFound()
	}

	return (
		<div className="space-y-6">
			<CategoryForm initialData={category} />
		</div>
	)
}
