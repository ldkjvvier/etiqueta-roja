import { createClient } from '@/lib/supabase/server'
import type {
	DataResult,
	PaginatedResult,
	Order,
	OrderWithItems,
	InsertOrder,
	InsertOrderItem,
	OrderStatus,
} from '@/types/database.types'

const ORDER_WITH_ITEMS_SELECT = `
	id, store_id, customer_id, order_number, status, total_amount, shipping_address, created_at,
	order_items (
		id, order_id, variant_id, product_name, variant_details, quantity, unit_price,
		product_variants (
			id, sku, combination_key, price, stock_quantity, reserved_stock,
			is_active, image_url, track_inventory
		)
	),
	customers (
		id, email, first_name, last_name, phone, auth_user_id
	)
`

export type OrderFilters = {
	status?: OrderStatus | 'all'
	page?: number
	pageSize?: number
}

function mapOrderError(code: string | undefined): string {
	switch (code) {
		case '23505':
			return 'Número de orden duplicado'
		case '23503':
			return 'Referencia inválida: cliente o variante no existe'
		default:
			return 'Error al procesar orden'
	}
}

export async function getCustomerOrders(
	customerId: string,
): Promise<DataResult<OrderWithItems[]>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data, error } = await db
		.from('orders')
		.select(ORDER_WITH_ITEMS_SELECT)
		.eq('customer_id', customerId)
		.order('created_at', { ascending: false })

	if (error) {
		console.error('[getCustomerOrders]', error)
		return { data: null, error: 'Error al cargar órdenes' }
	}

	return { data: data as OrderWithItems[], error: null }
}

export async function getOrderWithItems(
	orderId: string,
): Promise<DataResult<OrderWithItems>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data, error } = await db
		.from('orders')
		.select(ORDER_WITH_ITEMS_SELECT)
		.eq('id', orderId)
		.single()

	if (error) {
		console.error('[getOrderWithItems]', error)
		return { data: null, error: 'Orden no encontrada' }
	}

	return { data: data as OrderWithItems, error: null }
}

export async function getAdminOrders(
	storeId: string,
	filters: OrderFilters = {},
): Promise<PaginatedResult<OrderWithItems>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const page = filters.page ?? 1
	const pageSize = filters.pageSize ?? 20
	const from = (page - 1) * pageSize
	const to = from + pageSize - 1

	let query = db
		.from('orders')
		.select(ORDER_WITH_ITEMS_SELECT, { count: 'exact' })
		.eq('store_id', storeId)
		.range(from, to)
		.order('created_at', { ascending: false })

	if (filters.status && filters.status !== 'all') {
		query = query.eq('status', filters.status)
	}

	const { data, error, count } = await query

	if (error) {
		console.error('[getAdminOrders]', error)
		return {
			data: [],
			count: 0,
			page,
			pageSize,
			totalPages: 0,
			error: 'Error al cargar órdenes',
		}
	}

	const totalPages = Math.ceil((count ?? 0) / pageSize)
	return {
		data: (data as OrderWithItems[]) ?? [],
		count: count ?? 0,
		page,
		pageSize,
		totalPages,
		error: null,
	}
}

export async function createOrder(
	orderData: InsertOrder,
	items: Omit<InsertOrderItem, 'order_id'>[],
): Promise<DataResult<Order>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data: order, error: orderError } = await db
		.from('orders')
		.insert(orderData)
		.select(
			'id, store_id, customer_id, order_number, status, total_amount, shipping_address, created_at',
		)
		.single()

	if (orderError) {
		console.error('[createOrder] order insert', orderError)
		return { data: null, error: mapOrderError(orderError.code) }
	}

	const itemsWithOrderId = items.map(item => ({
		...item,
		order_id: (order as Order).id,
	}))

	const { error: itemsError } = await db
		.from('order_items')
		.insert(itemsWithOrderId)

	if (itemsError) {
		console.error('[createOrder] items insert', itemsError)
		await db.from('orders').delete().eq('id', (order as Order).id)
		return { data: null, error: 'Error al guardar ítems de la orden' }
	}

	return { data: order as Order, error: null }
}

export async function updateOrderStatus(
	orderId: string,
	status: OrderStatus,
): Promise<DataResult<Order>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data: order, error } = await db
		.from('orders')
		.update({ status })
		.eq('id', orderId)
		.select(
			'id, store_id, customer_id, order_number, status, total_amount, shipping_address, created_at',
		)
		.single()

	if (error) {
		console.error('[updateOrderStatus]', error)
		return { data: null, error: 'Error al actualizar estado de la orden' }
	}

	return { data: order as Order, error: null }
}
