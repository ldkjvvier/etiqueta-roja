'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'
import {
	createOrder,
	updateOrderStatus,
	getOrderWithItems,
} from '@/lib/data/orders'
import type { Json } from '@/lib/supabase/types'
import type { OrderStatus, InsertOrder, InsertOrderItem } from '@/types/database.types'

type ActionResult<T = undefined> = {
	success: boolean
	data?: T
	error?: string
}

const cartItemSchema = z.object({
	variantId: z.string().uuid(),
	productName: z.string().min(1),
	variantDetails: z.string().optional(),
	quantity: z.number().int().positive(),
	unitPrice: z.number().positive(),
})

const shippingSchema = z.object({
	name: z.string().min(1).max(255),
	phone: z.string().min(1).max(50),
	address: z.record(z.unknown()).optional(),
})

type CartItem = z.infer<typeof cartItemSchema>
type ShippingData = z.infer<typeof shippingSchema>

function generateOrderNumber(): string {
	const timestamp = Date.now().toString(36).toUpperCase()
	const random = Math.random().toString(36).slice(2, 6).toUpperCase()
	return `ER-${timestamp}-${random}`
}

export async function create(
	cartItems: CartItem[],
	shipping: ShippingData,
	storeId: string,
	customerId: string,
): Promise<ActionResult<{ id: string; orderNumber: string }>> {
	const parsedItems = z.array(cartItemSchema).safeParse(cartItems)
	const parsedShipping = shippingSchema.safeParse(shipping)

	if (!parsedItems.success) {
		return { success: false, error: 'Ítems del carrito inválidos' }
	}
	if (!parsedShipping.success) {
		return { success: false, error: 'Datos de envío inválidos' }
	}

	const totalAmount = parsedItems.data.reduce(
		(sum, item) => sum + item.unitPrice * item.quantity,
		0,
	)

	for (let attempt = 0; attempt < 3; attempt++) {
		const orderData: InsertOrder = {
			store_id: storeId,
			customer_id: customerId,
			order_number: generateOrderNumber(),
			status: 'pending',
			total_amount: totalAmount,
			shipping_address: parsedShipping.data as unknown as Json,
		}

		const items: Omit<InsertOrderItem, 'order_id'>[] = parsedItems.data.map(
			item => ({
				variant_id: item.variantId,
				product_name: item.productName,
				variant_details: item.variantDetails ?? null,
				quantity: item.quantity,
				unit_price: item.unitPrice,
			}),
		)

		const { data, error } = await createOrder(orderData, items)

		if (!error && data) {
			revalidatePath('/admin/orders')
			return {
				success: true,
				data: { id: data.id, orderNumber: data.order_number },
			}
		}

		if (error && !error.includes('duplicado')) {
			return { success: false, error }
		}
	}

	return {
		success: false,
		error: 'Error al crear la orden, intente nuevamente',
	}
}

const ORDER_STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
	pending: 'paid',
	paid: 'processing',
	processing: 'shipped',
	shipped: 'delivered',
}

export async function advanceStatus(
	orderId: string,
): Promise<ActionResult<{ status: OrderStatus }>> {
	if (!orderId) return { success: false, error: 'ID de orden requerido' }

	try {
		await getAdminStoreContext()
	} catch {
		return { success: false, error: 'Sin acceso de administrador' }
	}

	const { data: order, error: fetchError } = await getOrderWithItems(orderId)
	if (fetchError || !order) {
		return { success: false, error: 'Orden no encontrada' }
	}

	const currentStatus = order.status as OrderStatus
	const nextStatus = ORDER_STATUS_TRANSITIONS[currentStatus]

	if (!nextStatus) {
		return {
			success: false,
			error: `No se puede avanzar desde estado "${currentStatus}"`,
		}
	}

	const { data: updated, error } = await updateOrderStatus(orderId, nextStatus)
	if (error || !updated) {
		return { success: false, error: error ?? 'Error al actualizar estado' }
	}

	if (nextStatus === 'paid') {
		await applyPaidInventory(
			order.order_items.map(i => ({
				variantId: i.variant_id,
				quantity: i.quantity,
			})),
		)
	}

	revalidatePath('/admin/orders')
	revalidatePath(`/admin/orders/${orderId}`)

	return { success: true, data: { status: nextStatus } }
}

type OrderItemInventory = { variantId: string | null; quantity: number }

type VariantStock = {
	stock_quantity: number | null
	reserved_stock: number | null
	track_inventory: boolean | null
}

async function applyPaidInventory(items: OrderItemInventory[]): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = (await createClient()) as any

	for (const item of items) {
		if (!item.variantId) continue

		const { data: variant } = (await db
			.from('product_variants')
			.select('stock_quantity, reserved_stock, track_inventory')
			.eq('id', item.variantId)
			.single()) as { data: VariantStock | null }

		if (!variant?.track_inventory) continue

		const newStock = Math.max(
			0,
			(variant.stock_quantity ?? 0) - item.quantity,
		)
		const newReserved = Math.max(
			0,
			(variant.reserved_stock ?? 0) - item.quantity,
		)

		await db
			.from('product_variants')
			.update({ stock_quantity: newStock, reserved_stock: newReserved })
			.eq('id', item.variantId)
	}
}

export async function cancel(orderId: string): Promise<ActionResult> {
	if (!orderId) return { success: false, error: 'ID de orden requerido' }

	try {
		await getAdminStoreContext()
	} catch {
		return { success: false, error: 'Sin acceso de administrador' }
	}

	const { data: order, error: fetchError } = await getOrderWithItems(orderId)
	if (fetchError || !order) {
		return { success: false, error: 'Orden no encontrada' }
	}

	const cancellable: OrderStatus[] = ['pending', 'paid', 'processing']
	if (!cancellable.includes(order.status as OrderStatus)) {
		return {
			success: false,
			error: 'Esta orden no puede cancelarse en su estado actual',
		}
	}

	if (order.status === 'pending' || order.status === 'paid') {
		await releaseReservedInventory(
			order.order_items.map(i => ({
				variantId: i.variant_id,
				quantity: i.quantity,
			})),
		)
	}

	const { error } = await updateOrderStatus(orderId, 'cancelled')
	if (error) return { success: false, error }

	revalidatePath('/admin/orders')

	return { success: true }
}

async function releaseReservedInventory(
	items: OrderItemInventory[],
): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = (await createClient()) as any

	for (const item of items) {
		if (!item.variantId) continue

		const { data: variant } = (await db
			.from('product_variants')
			.select('reserved_stock, track_inventory')
			.eq('id', item.variantId)
			.single()) as {
			data: Pick<VariantStock, 'reserved_stock' | 'track_inventory'> | null
		}

		if (!variant?.track_inventory) continue

		const newReserved = Math.max(
			0,
			(variant.reserved_stock ?? 0) - item.quantity,
		)

		await db
			.from('product_variants')
			.update({ reserved_stock: newReserved })
			.eq('id', item.variantId)
	}
}
