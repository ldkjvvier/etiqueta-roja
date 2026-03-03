import { getAdminDrops } from '@/lib/services/drops'
import { advanceDropStatus } from '@/lib/actions/drops-admin'
import { Button } from '@/components/ui/button'
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
	const page = Number(params.page) || 1
	const limit = 20
	const status =
		(params.status as 'scheduled' | 'live' | 'ended' | 'all') || 'all'
	const { items, totalCount, totalPages } = await getAdminDrops({
		page,
		limit,
		status,
	})

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
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Drops</h1>
				<p className="text-muted-foreground">
					Gestiona lanzamientos limitados sin cálculos en frontend.
				</p>
			</div>

			<div className="rounded-md border bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Inicio</TableHead>
							<TableHead>Fin</TableHead>
							<TableHead className="text-right">Acción</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((drop: any) => (
							<TableRow key={drop.id}>
								<TableCell className="font-medium">
									{drop.name}
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
								</TableCell>
							</TableRow>
						))}
						{items.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center">
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
					<Button
						asChild
						size="sm"
						variant="outline"
						disabled={page <= 1}
					>
						<a href={buildPageUrl(page - 1)}>Anterior</a>
					</Button>
					<Button
						asChild
						size="sm"
						variant="outline"
						disabled={page >= totalPages}
					>
						<a href={buildPageUrl(page + 1)}>Siguiente</a>
					</Button>
				</div>
			</div>
		</div>
	)
}
