import { getAdminOrders } from '@/lib/services/orders'
import { advanceOrderStatus } from '@/lib/actions/orders-admin'
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

export default async function AdminOrdersPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const params = await searchParams
	const page = Number(params.page) || 1
	const limit = 20
	const status =
		(params.status as
			| 'pending'
			| 'paid'
			| 'processing'
			| 'shipped'
			| 'delivered'
			| 'cancelled'
			| 'all') || 'all'

	const { items, totalCount, totalPages } = await getAdminOrders({
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
		return `/admin/orders?${query.toString()}`
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
				<p className="text-muted-foreground">
					Listado paginado optimizado con snapshots de order_items.
				</p>
			</div>
			<div className="rounded-md border bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead># Orden</TableHead>
							<TableHead>Cliente</TableHead>
							<TableHead>Entrega</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Items</TableHead>
							<TableHead>Total</TableHead>
							<TableHead>Fecha</TableHead>
							<TableHead className="text-right">Acción</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((order: any) => (
							<TableRow key={order.id}>
								<TableCell className="font-medium">
									{order.order_number}
								</TableCell>
								<TableCell>{order.customer_name}</TableCell>
								<TableCell className="max-w-70 truncate text-muted-foreground">
									{order.shipping_summary}
								</TableCell>
								<TableCell>
									<Badge variant="outline">{order.status}</Badge>
								</TableCell>
								<TableCell>{order.items_count}</TableCell>
								<TableCell>
									$
									{Number(order.total_amount || 0).toLocaleString(
										'es-CL',
									)}
								</TableCell>
								<TableCell>
									{new Date(order.created_at).toLocaleDateString(
										'es-CL',
									)}
								</TableCell>
								<TableCell className="text-right">
									<form action={advanceOrderStatus}>
										<input
											type="hidden"
											name="orderId"
											value={order.id}
										/>
										<Button
											size="sm"
											variant="outline"
											disabled={
												order.status === 'delivered' ||
												order.status === 'cancelled'
											}
										>
											Avanzar estado
										</Button>
									</form>
								</TableCell>
							</TableRow>
						))}
						{items.length === 0 && (
							<TableRow>
								<TableCell colSpan={8} className="h-24 text-center">
									No hay órdenes.
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
