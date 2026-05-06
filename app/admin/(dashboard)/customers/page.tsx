import { getAdminCustomers } from '@/lib/services/customers'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

export default async function AdminCustomersPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const params = await searchParams
	const requestedPage = Number(params.page)
	const page =
		Number.isFinite(requestedPage) && requestedPage > 0
			? requestedPage
			: 1
	const limit = 20
	const fromDate = (params.from as string) || undefined
	const toDate = (params.to as string) || undefined

	const { items, totalCount, totalPages } = await getAdminCustomers({
		page,
		limit,
		fromDate,
		toDate,
	})
	const hasPreviousPage = page > 1
	const hasNextPage = totalPages > 0 && page < totalPages

	const buildPageUrl = (nextPage: number) => {
		const query = new URLSearchParams()
		query.set('page', String(nextPage))
		if (fromDate) query.set('from', fromDate)
		if (toDate) query.set('to', toDate)
		return `/admin/customers?${query.toString()}`
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Clientes
				</h1>
				<p className="text-muted-foreground">
					Paginado con filtros por fecha y total_spent precalculado.
				</p>
			</div>
			<div className="rounded-md border bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Teléfono</TableHead>
							<TableHead>Total gastado</TableHead>
							<TableHead>Alta</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((customer: any) => (
							<TableRow key={customer.id}>
								<TableCell className="font-medium">
									{[customer.first_name, customer.last_name]
										.filter(Boolean)
										.join(' ') || '—'}
								</TableCell>
								<TableCell>{customer.email}</TableCell>
								<TableCell>{customer.phone || '—'}</TableCell>
								<TableCell>
									$
									{Number(customer.total_spent || 0).toLocaleString(
										'es-CL',
									)}
								</TableCell>
								<TableCell>
									{new Date(customer.created_at).toLocaleDateString(
										'es-CL',
									)}
								</TableCell>
							</TableRow>
						))}
						{items.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center">
									No hay clientes.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Total: {totalCount}
				</p>
				<div className="flex items-center gap-2">
					{hasPreviousPage ? (
						<Button asChild size="sm" variant="outline">
							<Link href={buildPageUrl(page - 1)}>Anterior</Link>
						</Button>
					) : (
						<Button size="sm" variant="outline" disabled>
							Anterior
						</Button>
					)}
					{hasNextPage ? (
						<Button asChild size="sm" variant="outline">
							<Link href={buildPageUrl(page + 1)}>Siguiente</Link>
						</Button>
					) : (
						<Button size="sm" variant="outline" disabled>
							Siguiente
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
