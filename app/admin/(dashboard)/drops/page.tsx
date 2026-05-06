import { getAdminDrops } from '@/lib/services/drops'
import { advanceDropStatus } from '@/lib/actions/drops-admin'
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
import { Badge } from '@/components/ui/badge'

export default async function AdminDropsPage({
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
	const status =
		(params.status as 'scheduled' | 'live' | 'ended' | 'all') || 'all'
	const { items, totalCount, totalPages } = await getAdminDrops({
		page,
		limit,
		status,
	})
	const hasPreviousPage = page > 1
	const hasNextPage = totalPages > 0 && page < totalPages

	const buildPageUrl = (nextPage: number) => {
		const query = new URLSearchParams()
		query.set('page', String(nextPage))
		if (status && status !== 'all') {
			query.set('status', status)
		}
		return `/admin/drops?${query.toString()}`
	}

	return (
		<div className="space-y-6">
			<div className="flex items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Drops</h1>
					<p className="text-muted-foreground">
						Gestiona lanzamientos limitados sin cálculos en frontend.
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/drops/new">Nuevo Drop</Link>
				</Button>
			</div>

			<div className="rounded-md border bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Descripción</TableHead>
							<TableHead>Portada</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Inicio</TableHead>
							<TableHead>Fin</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((drop: any) => (
							<TableRow key={drop.id}>
								<TableCell className="font-medium">
									{drop.name}
								</TableCell>
								<TableCell className="font-mono text-xs">
									{drop.slug}
								</TableCell>
								<TableCell className="max-w-70 truncate text-muted-foreground">
									{drop.description || '—'}
								</TableCell>
								<TableCell>
									{drop.cover_image ? (
										<img
											src={drop.cover_image}
											alt={`Portada ${drop.name}`}
											className="h-10 w-10 rounded object-cover border"
										/>
									) : (
										'—'
									)}
								</TableCell>
								<TableCell>
									<Badge variant="outline">{drop.status}</Badge>
								</TableCell>
								<TableCell>
									{new Date(drop.start_time).toLocaleString('es-CL')}
								</TableCell>
								<TableCell>
									{drop.end_time
										? new Date(drop.end_time).toLocaleString('es-CL')
										: '—'}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										<Button asChild size="sm" variant="secondary">
											<Link href={`/admin/drops/${drop.id}`}>
												Editar
											</Link>
										</Button>
										<form action={advanceDropStatus}>
											<input
												type="hidden"
												name="dropId"
												value={drop.id}
											/>
											<Button
												size="sm"
												variant="outline"
												disabled={drop.status === 'ended'}
											>
												{drop.status === 'scheduled'
													? 'Pasar a live'
													: drop.status === 'live'
														? 'Finalizar'
														: 'Cerrado'}
											</Button>
										</form>
									</div>
								</TableCell>
							</TableRow>
						))}
						{items.length === 0 && (
							<TableRow>
								<TableCell colSpan={8} className="h-24 text-center">
									No hay drops.
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
							<a href={buildPageUrl(page - 1)}>Anterior</a>
						</Button>
					) : (
						<Button size="sm" variant="outline" disabled>
							Anterior
						</Button>
					)}
					{hasNextPage ? (
						<Button asChild size="sm" variant="outline">
							<a href={buildPageUrl(page + 1)}>Siguiente</a>
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
