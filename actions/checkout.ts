'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getPublicStoreContext } from '@/lib/data/admin-context'

const cartItemSchema = z.object({
	variantId: z.string().uuid(),
	productName: z.string(),
	variantDetails: z.string().optional(),
	quantity: z.number().int().positive(),
	unitPrice: z.number().nonnegative(),
})

const checkoutSchema = z.object({
	items: z.array(cartItemSchema).min(1),
	customer: z.object({
		email: z.string().email(),
		first_name: z.string().min(1),
		last_name: z.string().optional(),
		phone: z.string().optional(),
	}),
	shipping_address: z.record(z.unknown()).optional(),
})

type ActionResult<T = void> = { success: boolean; data?: T; error?: string }

export async function createPendingOrderFromCart(
	payload: z.infer<typeof checkoutSchema>,
): Promise<ActionResult<{ orderId: string; whatsappUrl: string }>> {
	const parsed = checkoutSchema.safeParse(payload)
	if (!parsed.success)
		return { success: false, error: parsed.error.errors[0].message }

	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { storeId } = await getPublicStoreContext()
	const { items, customer, shipping_address } = parsed.data

	// 1. Validate stock before creating the order
	const variantIds = items.map((i) => i.variantId)
	const { data: variants, error: stockError } = await db
		.from('product_variants')
		.select('id, stock_quantity, reserved_stock, is_active')
		.in('id', variantIds)
		.is('deleted_at', null)

	if (stockError || !variants)
		return { success: false, error: 'Error al verificar stock' }

	for (const item of items) {
		const v = variants.find((v: { id: string }) => v.id === item.variantId)
		if (!v || !v.is_active)
			return {
				success: false,
				error: `Producto no disponible: ${item.productName}`,
			}
		const available = v.stock_quantity - v.reserved_stock
		if (item.quantity > available) {
			return {
				success: false,
				error: `Stock insuficiente: ${item.productName} (disponible: ${available})`,
			}
		}
	}

	// 2. Upsert customer
	const { data: existingCustomer } = await db
		.from('customers')
		.select('id')
		.eq('store_id', storeId)
		.eq('email', customer.email)
		.maybeSingle()

	let customerId: string

	if (existingCustomer) {
		customerId = existingCustomer.id
	} else {
		const { data: newCustomer, error: customerError } = await db
			.from('customers')
			.insert({ store_id: storeId, ...customer })
			.select('id')
			.single()
		if (customerError || !newCustomer)
			return { success: false, error: 'Error al registrar cliente' }
		customerId = newCustomer.id
	}

	// 3. Generate order_number
	const prefix = 'ER'
	const padding = 5
	const { count } = await db
		.from('orders')
		.select('id', { count: 'exact', head: true })
		.eq('store_id', storeId)
	const orderNumber = `${prefix}-${String((count ?? 0) + 1).padStart(padding, '0')}`

	// 4. Create order
	const totalAmount = items.reduce(
		(sum, i) => sum + i.quantity * i.unitPrice,
		0,
	)
	const { data: order, error: orderError } = await db
		.from('orders')
		.insert({
			store_id: storeId,
			customer_id: customerId,
			order_number: orderNumber,
			status: 'pending',
			total_amount: totalAmount,
			shipping_address: shipping_address ?? null,
		})
		.select('id')
		.single()

	if (orderError || !order) {
		console.error('[createPendingOrderFromCart] order', orderError)
		return { success: false, error: 'Error al crear la orden' }
	}

	// 5. Insert order_items — total_price is GENERATED ALWAYS, never include it
	const orderItems = items.map((i) => ({
		order_id: order.id,
		variant_id: i.variantId,
		product_name: i.productName,
		variant_details: i.variantDetails ?? null,
		quantity: i.quantity,
		unit_price: i.unitPrice,
	}))

	const { error: itemsError } = await db.from('order_items').insert(orderItems)
	if (itemsError) {
		console.error('[createPendingOrderFromCart] items', itemsError)
		return { success: false, error: 'Error al registrar productos de la orden' }
	}

	// 6. Build WhatsApp URL — replace number or read from site_config
	const itemLines = items
		.map(
			(i) =>
				`• ${i.productName} x${i.quantity} — $${i.unitPrice.toLocaleString('es-CL')}`,
		)
		.join('\n')
	const message = encodeURIComponent(
		`Hola! Quiero confirmar mi pedido:\n\n${itemLines}\n\nTotal: $${totalAmount.toLocaleString('es-CL')}\nN° Orden: ${orderNumber}`,
	)
	const whatsappUrl = `https://wa.me/56900000000?text=${message}`

	return { success: true, data: { orderId: order.id, whatsappUrl } }
}
