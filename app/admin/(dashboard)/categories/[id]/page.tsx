import { notFound } from 'next/navigation'
import { getCategoryById } from '@/lib/services/categories-server'
import { CategoryForm } from '@/components/admin/category-form'

interface PageProps {
	params: Promise<{ id: string }>
}

export default async function EditCategoryPage({
	params,
}: PageProps) {
	const { id } = await params
	const category = await getCategoryById(id)

	if (!category) {
		notFound()
	}

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<CategoryForm initialData={category} />
		</div>
	)
}
