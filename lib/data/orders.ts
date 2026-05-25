import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/data/admin-context'
import type { InsertOrder, InsertOrderItem, OrderStatus } from '@/types/database.types'

type DataResult<T> = { data: T | null; error: string | null }

export interface GetAdminOrdersParams {
	page?: number
	limit?: number
	status?:
		| 'pending'
		| 'paid'
		| 'processing'
		| 'shipped'
		| 'delivered'
		| 'cancelled'
		| 'all'
}

export async function getAdminOrders({
	page = 1,
	limit = 20,
	status = 'all',
}: GetAdminOrdersParams) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()
	const from = (page - 1) * limit
	const to = from + limit - 1

	let request = db
		.from('orders')
		.select(
			'id,order_number,status,total_amount,shipping_address,created_at,customer:customers(first_name,last_name,email),items:order_items(count)',
			{
				count: 'exact',
			},
		)
		.eq('store_id', store.storeId)

	if (status !== 'all') {
		request = request.eq('status', status)
	}

	const { data, error, count } = await request
		.order('created_at', { ascending: false })
		.range(from, to)

	if (error) {
		console.error('Error loading orders:', error)
		return { items: [], totalCount: 0, totalPages: 0 }
	}

	const formatShippingSummary = (shippingAddress: unknown) => {
		if (!shippingAddress || typeof shippingAddress !== 'object') {
			return '—'
		}

		const shipping = shippingAddress as Record<string, unknown>
		const parts = [
			shipping.address,
			shipping.addressLine1,
			shipping.city,
			shipping.comuna,
			shipping.region,
			shipping.channel,
			shipping.customerEmail,
		]
			.filter((value): value is string => typeof value === 'string')
			.map((value) => value.trim())
			.filter(Boolean)

		return parts.length > 0 ? parts.join(' · ') : '—'
	}

	const items = (data ?? []).map((row: any) => ({
		id: row.id,
		order_number: row.order_number,
		status: row.status,
		total_amount: row.total_amount,
		created_at: row.created_at,
		shipping_summary: formatShippingSummary(row.shipping_address),
		customer_name:
			[row.customer?.first_name, row.customer?.last_name]
				.filter(Boolean)
				.join(' ') ||
			row.customer?.email ||
			'Invitado',
		items_count: row.items?.[0]?.count ?? 0,
	}))

	return {
		items,
		totalCount: count ?? 0,
		totalPages: Math.ceil((count ?? 0) / limit),
	}
}

export async function getAdminOrderById(id: string) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const { data: order, error } = await db
		.from('orders')
		.select(
			'id,order_number,status,total_amount,shipping_address,created_at,customer:customers(id,first_name,last_name,email)',
		)
		.eq('id', id)
		.eq('store_id', store.storeId)
		.maybeSingle()

	if (error || !order) return null

	const { data: orderItems } = await db
		.from('order_items')
		.select('id,product_name,variant_details,quantity,unit_price')
		.eq('order_id', id)
		.order('id', { ascending: true })

	return {
		...order,
		items: orderItems ?? [],
	}
}

export async function createOrder(
	orderData: InsertOrder,
	items: Omit<InsertOrderItem, 'order_id'>[],
): Promise<DataResult<{ id: string; order_number: string }>> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = (await createClient()) as any

	const { data: order, error: orderError } = await db
		.from('orders')
		.insert(orderData)
		.select('id, order_number')
		.single()

	if (orderError) {
		const msg = orderError.message ?? ''
		const isDuplicate =
			msg.includes('duplicate') || msg.includes('duplicado')
		return {
			data: null,
			error: isDuplicate ? 'duplicado' : 'Error al crear orden',
		}
	}

	const orderItems = items.map((item) => ({
		...item,
		order_id: order.id,
	}))

	const { error: itemsError } = await db
		.from('order_items')
		.insert(orderItems)

	if (itemsError) {
		console.error('[createOrder] items error', itemsError)
		return { data: null, error: 'Error al insertar ítems' }
	}

	return { data: order, error: null }
}

export async function updateOrderStatus(
	orderId: string,
	status: OrderStatus,
): Promise<DataResult<{ id: string; status: OrderStatus }>> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = (await createClient()) as any

	const { data, error } = await db
		.from('orders')
		.update({ status })
		.eq('id', orderId)
		.select('id, status')
		.single()

	if (error) {
		console.error('[updateOrderStatus]', error)
		return { data: null, error: 'Error al actualizar estado' }
	}
	return { data, error: null }
}

type OrderWithItems = {
	id: string
	order_number: string
	status: string
	total_amount: number
	shipping_address: unknown
	created_at: string
	order_items: Array<{
		id: string
		variant_id: string | null
		product_name: string
		variant_details: string | null
		quantity: number
		unit_price: number
	}>
}

export async function getOrderWithItems(
	orderId: string,
): Promise<DataResult<OrderWithItems>> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = (await createClient()) as any

	const { data: order, error } = await db
		.from('orders')
		.select(
			'id,order_number,status,total_amount,shipping_address,created_at,order_items(id,variant_id,product_name,variant_details,quantity,unit_price)',
		)
		.eq('id', orderId)
		.maybeSingle()

	if (error || !order) {
		return { data: null, error: 'Orden no encontrada' }
	}
	return { data: order as OrderWithItems, error: null }
}
