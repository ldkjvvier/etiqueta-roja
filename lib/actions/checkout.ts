'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export type CheckoutCartItem = {
	id: string
	name: string
	size: string
	quantity: number
	price: number
}

function normalizeSize(size: string) {
	return (size || '').toLowerCase().trim().replace(/\s+/g, '-')
}

function combinationKeyFromSize(size: string) {
	return `size:${normalizeSize(size)}`
}

function generateOrderNumber() {
	const now = new Date()
	const yy = String(now.getFullYear()).slice(2)
	const mm = String(now.getMonth() + 1).padStart(2, '0')
	const dd = String(now.getDate()).padStart(2, '0')
	const rand = Math.floor(Math.random() * 9000 + 1000)
	return `ER-${yy}${mm}${dd}-${rand}`
}

async function reserveVariantStock(
	db: any,
	variantId: string,
	quantity: number,
) {
	for (let attempt = 0; attempt < 3; attempt++) {
		const { data: variant, error: variantError } = await db
			.from('product_variants')
			.select('id,stock_quantity,reserved_stock')
			.eq('id', variantId)
			.eq('is_active', true)
			.is('deleted_at', null)
			.maybeSingle()

		if (variantError || !variant) {
			throw new Error('Variante no disponible')
		}

		const currentReserved = variant.reserved_stock || 0
		const available = Math.max(
			(variant.stock_quantity || 0) - currentReserved,
			0,
		)
		if (available < quantity) {
			throw new Error('Stock insuficiente para una o más variantes')
		}

		const { data: updated, error: updateError } = await db
			.from('product_variants')
			.update({
				reserved_stock: currentReserved + quantity,
			})
			.eq('id', variantId)
			.eq('reserved_stock', currentReserved)
			.select('id')
			.maybeSingle()

		if (!updateError && updated) {
			return
		}
	}

	throw new Error(
		'No se pudo reservar stock por concurrencia. Reintenta.',
	)
}

async function releaseVariantStock(
	db: any,
	variantId: string,
	quantity: number,
) {
	const { data: variant } = await db
		.from('product_variants')
		.select('id,reserved_stock')
		.eq('id', variantId)
		.maybeSingle()

	if (!variant) return

	const currentReserved = variant.reserved_stock || 0
	const nextReserved = Math.max(currentReserved - quantity, 0)

	await db
		.from('product_variants')
		.update({ reserved_stock: nextReserved })
		.eq('id', variantId)
}

export async function createPendingOrderFromCart(input: {
	items: CheckoutCartItem[]
	whatsappNumber?: string
}) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	const items = input.items || []
	if (!items.length) {
		return { error: true, message: 'El carrito está vacío' }
	}

	const distinctProductIds = Array.from(
		new Set(items.map((item) => item.id)),
	)
	const combinationByProduct = new Map<string, string>()
	for (const item of items) {
		combinationByProduct.set(
			`${item.id}::${item.size}`,
			combinationKeyFromSize(item.size),
		)
	}

	const [
		{ data: products, error: productsError },
		{ data: variants, error: variantsError },
	] = await Promise.all([
		db
			.from('products')
			.select('id,name,base_price,store_id,status,deleted_at')
			.in('id', distinctProductIds)
			.eq('store_id', store.id)
			.eq('status', 'active')
			.is('deleted_at', null),
		db
			.from('product_variants')
			.select(
				'id,product_id,combination_key,stock_quantity,reserved_stock,is_active,deleted_at',
			)
			.in('product_id', distinctProductIds)
			.eq('is_active', true)
			.is('deleted_at', null),
	])

	if (productsError || variantsError) {
		return {
			error: true,
			message: 'No se pudo validar el stock actual',
		}
	}

	const productMap = new Map<string, any>(
		(products ?? []).map((product: any) => [product.id, product]),
	)
	const variantMap = new Map<string, any>()
	for (const variant of variants ?? []) {
		variantMap.set(
			`${variant.product_id}::${variant.combination_key}`,
			variant,
		)
	}

	const resolvedItems: Array<{
		productId: string
		productName: string
		variantId: string
		size: string
		quantity: number
		unitPrice: number
	}> = []

	for (const item of items) {
		const product = productMap.get(item.id)
		const combinationKey = combinationByProduct.get(
			`${item.id}::${item.size}`,
		)
		const variant = combinationKey
			? variantMap.get(`${item.id}::${combinationKey}`)
			: null

		if (!product || !variant) {
			return {
				error: true,
				message: `Producto o variante inválida (${item.name} - ${item.size})`,
			}
		}

		const available = Math.max(
			(variant.stock_quantity || 0) - (variant.reserved_stock || 0),
			0,
		)
		if (available < item.quantity) {
			return {
				error: true,
				message: `Stock insuficiente para ${item.name} (${item.size})`,
			}
		}

		resolvedItems.push({
			productId: item.id,
			productName: product.name,
			variantId: variant.id,
			size: item.size,
			quantity: item.quantity,
			unitPrice: Number(item.price || product.base_price || 0),
		})
	}

	const reserved: Array<{ variantId: string; quantity: number }> = []
	try {
		for (const item of resolvedItems) {
			await reserveVariantStock(db, item.variantId, item.quantity)
			reserved.push({
				variantId: item.variantId,
				quantity: item.quantity,
			})
		}

		const orderNumber = generateOrderNumber()
		const totalAmount = resolvedItems.reduce(
			(acc, item) => acc + item.unitPrice * item.quantity,
			0,
		)

		let customerId: string | null = null
		const customerEmail =
			user?.email || `guest+${Date.now()}@etiquetaroja.local`

		if (user?.id) {
			const { data: existingCustomer } = await db
				.from('customers')
				.select('id')
				.eq('store_id', store.id)
				.eq('auth_user_id', user.id)
				.is('deleted_at', null)
				.maybeSingle()

			if (existingCustomer?.id) {
				customerId = existingCustomer.id
			} else {
				const { data: newCustomer } = await db
					.from('customers')
					.insert({
						store_id: store.id,
						auth_user_id: user.id,
						email: customerEmail,
					})
					.select('id')
					.single()

				customerId = newCustomer?.id || null
			}
		}

		const { data: order, error: orderError } = await db
			.from('orders')
			.insert({
				store_id: store.id,
				customer_id: customerId,
				order_number: orderNumber,
				status: 'pending',
				total_amount: totalAmount,
				shipping_address: {
					channel: 'whatsapp',
					customerEmail,
				},
			})
			.select('id,order_number')
			.single()

		if (orderError || !order) {
			throw new Error('No se pudo crear la orden')
		}

		const itemsPayload = resolvedItems.map((item) => ({
			order_id: order.id,
			variant_id: item.variantId,
			product_name: item.productName,
			variant_details: `Talla: ${item.size}`,
			quantity: item.quantity,
			unit_price: item.unitPrice,
		}))

		const { error: itemsError } = await db
			.from('order_items')
			.insert(itemsPayload)

		if (itemsError) {
			throw new Error('No se pudo guardar el detalle de la orden')
		}

		const cleanNumber = (input.whatsappNumber || '').replace(
			/[^0-9]/g,
			'',
		)
		const message = [
			`Hola ETIQUETA ROJA, confirmo mi pedido ${order.order_number}:`,
			'',
		]
		for (const item of resolvedItems) {
			message.push(
				`• ${item.productName} (${item.size}) x${item.quantity}`,
			)
		}
		message.push('', `Total: $${totalAmount.toLocaleString('es-CL')}`)

		const whatsappUrl = cleanNumber
			? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message.join('\n'))}`
			: null

		return {
			error: false,
			orderId: order.id,
			orderNumber: order.order_number,
			whatsappUrl,
		}
	} catch (error: any) {
		for (const item of reserved.reverse()) {
			await releaseVariantStock(db, item.variantId, item.quantity)
		}

		return {
			error: true,
			message: error?.message || 'No se pudo procesar el checkout',
		}
	}
}
