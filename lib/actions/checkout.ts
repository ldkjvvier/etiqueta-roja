'use server'

import { createClient } from '@/lib/supabase/server'
import { getPublicStoreContext } from '@/lib/data/admin-context'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/types'

export type CheckoutCartItem = {
	id: string
	name: string
	size: string
	variantId?: string
	quantity: number
	price: number
}

function normalizeSize(size: string) {
	return (size || '').toLowerCase().trim().replace(/\s+/g, '-')
}

function combinationKeyFromSize(size: string) {
	return `size:${normalizeSize(size)}`
}

async function createOrder(
	supabase: SupabaseClient<Database>,
	payload: {
		store_id: string
		customer_id: string
		status: 'pending'
		total_amount: number
		shipping_address: Json
	},
) {
	const { data: orderNumber, error: seqError } = await supabase.rpc(
		'next_order_number',
	)
	if (seqError || !orderNumber) {
		return {
			data: null,
			error: seqError ?? {
				message: 'No se pudo generar número de orden',
			},
		}
	}

	return await supabase
		.from('orders')
		.insert({ ...payload, order_number: orderNumber })
		.select('id,order_number')
		.single()
}

export async function createPendingOrderFromCart(input: {
	items: CheckoutCartItem[]
	whatsappNumber?: string
}) {
	const supabase = await createClient()
	const { storeId } = await getPublicStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user?.id) {
		return {
			error: true,
			message:
				'Debes iniciar sesión para confirmar tu pedido con la configuración actual de seguridad.',
		}
	}

	const items = input.items || []
	if (!items.length) {
		return { error: true, message: 'El carrito está vacío' }
	}

	const cleanNumber = (input.whatsappNumber || '').replace(
		/[^0-9]/g,
		'',
	)
	if (!cleanNumber) {
		return {
			error: true,
			message: 'WhatsApp no está configurado para esta tienda.',
		}
	}

	const distinctProductIds = Array.from(
		new Set(items.map((item) => item.id)),
	)
	const distinctVariantIds = Array.from(
		new Set(
			items
				.map((item) => item.variantId)
				.filter((id): id is string => Boolean(id)),
		),
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
		supabase
			.from('products')
			.select('id,name,base_price,store_id,status,deleted_at')
			.in('id', distinctProductIds)
			.eq('store_id', storeId)
			.eq('status', 'active')
			.is('deleted_at', null),
		supabase
			.from('product_variants')
			.select(
				'id,product_id,combination_key,stock_quantity,reserved_stock,track_inventory,is_active,deleted_at',
			)
			.in(
				distinctVariantIds.length ? 'id' : 'product_id',
				distinctVariantIds.length
					? distinctVariantIds
					: distinctProductIds,
			)
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
	const variantById = new Map<string, any>()
	for (const variant of variants ?? []) {
		variantById.set(variant.id, variant)
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
		const variant = item.variantId
			? variantById.get(item.variantId)
			: combinationKey
				? variantMap.get(`${item.id}::${combinationKey}`)
				: null

		if (variant && variant.product_id !== item.id) {
			return {
				error: true,
				message: `Variante inválida para ${item.name}`,
			}
		}

		if (!product || !variant) {
			return {
				error: true,
				message: `Producto o variante inválida (${item.name} - ${item.size})`,
			}
		}

		const trackInventory = variant.track_inventory !== false
		const available = trackInventory
			? Math.max(
					(variant.stock_quantity || 0) -
						(variant.reserved_stock || 0),
					0,
				)
			: Number.MAX_SAFE_INTEGER
		if (trackInventory && available < item.quantity) {
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

	try {
		const totalAmount = resolvedItems.reduce(
			(acc, item) => acc + item.unitPrice * item.quantity,
			0,
		)

		const customerEmail = user.email || ''

		const { data: customer } = await supabase
			.from('customers')
			.select('id,email')
			.eq('store_id', storeId)
			.eq('auth_user_id', user.id)
			.is('deleted_at', null)
			.maybeSingle()

		if (!customer?.id) {
			return {
				error: true,
				message:
					'No encontramos tu perfil de cliente para esta tienda. Contacta al administrador para habilitar tu cuenta.',
			}
		}

		const { data: order, error: orderError } = await createOrder(
			supabase,
			{
				store_id: storeId,
				customer_id: customer.id,
				status: 'pending',
				total_amount: totalAmount,
				shipping_address: {
					channel: 'whatsapp',
					customerEmail: customer.email || customerEmail,
					authUserId: user.id,
				} as Json,
			},
		)

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

		const { error: itemsError } = await supabase
			.from('order_items')
			.insert(itemsPayload)

		if (itemsError) {
			throw new Error('No se pudo guardar el detalle de la orden')
		}

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
		return {
			error: true,
			message: error?.message || 'No se pudo procesar el checkout',
		}
	}
}
