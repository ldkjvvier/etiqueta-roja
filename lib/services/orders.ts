import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

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
			'id,order_number,status,total_amount,created_at,customer:customers(first_name,last_name,email),items:order_items(count)',
			{
				count: 'exact',
			},
		)
		.eq('store_id', store.id)

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

	const items = (data ?? []).map((row: any) => ({
		id: row.id,
		order_number: row.order_number,
		status: row.status,
		total_amount: row.total_amount,
		created_at: row.created_at,
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
		.eq('store_id', store.id)
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
