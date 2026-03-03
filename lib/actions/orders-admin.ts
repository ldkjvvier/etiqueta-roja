'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/services/admin-context'

const ORDER_STATUS_FLOW: Record<string, string> = {
	pending: 'paid',
	paid: 'processing',
	processing: 'shipped',
	shipped: 'delivered',
	delivered: 'delivered',
	cancelled: 'cancelled',
}

async function applyPaidInventoryMovement(db: any, orderId: string) {
	const { data: items } = await db
		.from('order_items')
		.select('variant_id,quantity')
		.eq('order_id', orderId)

	for (const item of items ?? []) {
		if (!item.variant_id) continue

		const { data: variant } = await db
			.from('product_variants')
			.select('id,stock_quantity,reserved_stock')
			.eq('id', item.variant_id)
			.maybeSingle()

		if (!variant) continue

		const qty = Number(item.quantity || 0)
		const nextStock = Math.max((variant.stock_quantity || 0) - qty, 0)
		const nextReserved = Math.max(
			(variant.reserved_stock || 0) - qty,
			0,
		)

		await db
			.from('product_variants')
			.update({
				stock_quantity: nextStock,
				reserved_stock: nextReserved,
			})
			.eq('id', item.variant_id)
	}
}

async function releaseReservedInventory(db: any, orderId: string) {
	const { data: items } = await db
		.from('order_items')
		.select('variant_id,quantity')
		.eq('order_id', orderId)

	for (const item of items ?? []) {
		if (!item.variant_id) continue

		const { data: variant } = await db
			.from('product_variants')
			.select('id,reserved_stock')
			.eq('id', item.variant_id)
			.maybeSingle()

		if (!variant) continue

		const qty = Number(item.quantity || 0)
		const nextReserved = Math.max(
			(variant.reserved_stock || 0) - qty,
			0,
		)

		await db
			.from('product_variants')
			.update({ reserved_stock: nextReserved })
			.eq('id', item.variant_id)
	}
}

export async function advanceOrderStatus(formData: FormData) {
	const orderId = String(formData.get('orderId') || '')
	if (!orderId) return

	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return

	const { data: order } = await db
		.from('orders')
		.select('id,status')
		.eq('id', orderId)
		.eq('store_id', store.id)
		.maybeSingle()

	if (!order) return

	const nextStatus = ORDER_STATUS_FLOW[order.status] || order.status

	if (order.status === 'pending' && nextStatus === 'paid') {
		await applyPaidInventoryMovement(db, orderId)
	}

	if (order.status === 'pending' && nextStatus === 'cancelled') {
		await releaseReservedInventory(db, orderId)
	}

	await db
		.from('orders')
		.update({ status: nextStatus })
		.eq('id', orderId)
		.eq('store_id', store.id)

	revalidatePath('/admin/orders')
}
