import { notFound } from 'next/navigation'
import { DropForm } from '@/components/admin/drop-form'
import { getAdminDropById } from '@/lib/services/drops'

interface PageProps {
	params: Promise<{ id: string }>
}

export default async function EditDropPage({ params }: PageProps) {
	const { id } = await params
	const drop = await getAdminDropById(id)

	if (!drop) {
		notFound()
	}

	return (
		<div className="space-y-6">
			<DropForm initialData={drop} />
		</div>
	)
}
