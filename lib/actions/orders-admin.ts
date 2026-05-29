'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/data/admin-context'

const ORDER_STATUS_FLOW: Record<string, string> = {
	pending: 'paid',
	paid: 'processing',
	processing: 'shipped',
	shipped: 'delivered',
	delivered: 'delivered',
	cancelled: 'cancelled',
}

type StatusActionResult = {
	error: boolean
	message: string
}

async function applyPaidInventoryMovement(db: any, orderId: string) {
	const { data: items, error: itemsError } = await db
		.from('order_items')
		.select('variant_id,quantity')
		.eq('order_id', orderId)

	if (itemsError) {
		throw itemsError
	}

	for (const item of items ?? []) {
		if (!item.variant_id) continue

		const { data: variant, error: variantError } = await db
			.from('product_variants')
			.select('id,stock_quantity,reserved_stock')
			.eq('id', item.variant_id)
			.maybeSingle()

		if (variantError) {
			throw variantError
		}

		if (!variant) continue

		const qty = Number(item.quantity || 0)
		const nextStock = Math.max((variant.stock_quantity || 0) - qty, 0)
		const nextReserved = Math.max(
			(variant.reserved_stock || 0) - qty,
			0,
		)

		const { error: updateError } = await db
			.from('product_variants')
			.update({
				stock_quantity: nextStock,
				reserved_stock: nextReserved,
			})
			.eq('id', item.variant_id)

		if (updateError) {
			throw updateError
		}
	}
}

async function releaseReservedInventory(db: any, orderId: string) {
	const { data: items, error: itemsError } = await db
		.from('order_items')
		.select('variant_id,quantity')
		.eq('order_id', orderId)

	if (itemsError) {
		throw itemsError
	}

	for (const item of items ?? []) {
		if (!item.variant_id) continue

		const { data: variant, error: variantError } = await db
			.from('product_variants')
			.select('id,reserved_stock')
			.eq('id', item.variant_id)
			.maybeSingle()

		if (variantError) {
			throw variantError
		}

		if (!variant) continue

		const qty = Number(item.quantity || 0)
		const nextReserved = Math.max(
			(variant.reserved_stock || 0) - qty,
			0,
		)

		const { error: updateError } = await db
			.from('product_variants')
			.update({ reserved_stock: nextReserved })
			.eq('id', item.variant_id)

		if (updateError) {
			throw updateError
		}
	}
}


export async function advanceOrderStatus(
	formData: FormData,
): Promise<StatusActionResult> {
	const orderId = String(formData.get('orderId') || '')
	if (!orderId) {
		return { error: true, message: 'Orden inválida' }
	}

	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		return { error: true, message: 'Unauthorized' }
	}

	try {
		const { data: order, error: orderError } = await db
			.from('orders')
			.select('id,status')
			.eq('id', orderId)
			.eq('store_id', store.storeId)
			.maybeSingle()

		if (orderError) {
			throw orderError
		}

		if (!order) {
			return { error: true, message: 'Orden no encontrada' }
		}

		if (
			order.status === 'delivered' ||
			order.status === 'cancelled'
		) {
			return {
				error: false,
				message: 'La orden ya se encuentra en un estado final',
			}
		}

		const nextStatus = ORDER_STATUS_FLOW[order.status] || order.status

		if (order.status === 'pending' && nextStatus === 'paid') {
			await applyPaidInventoryMovement(db, orderId)
		}

		if (order.status === 'pending' && nextStatus === 'cancelled') {
			await releaseReservedInventory(db, orderId)
		}

		const { error: updateError } = await db
			.from('orders')
			.update({ status: nextStatus })
			.eq('id', orderId)
			.eq('store_id', store.storeId)

		if (updateError) {
			throw updateError
		}

		revalidatePath('/admin/orders')
		return {
			error: false,
			message: 'Estado de la orden actualizado',
		}
	} catch (error) {
		console.error('[advanceOrderStatus]', error)
		return {
			error: true,
			message: 'No se pudo actualizar el estado de la orden',
		}
	}
}
