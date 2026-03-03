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

async function createOrderWithRetry(
	db: any,
	payload: {
		store_id: string
		customer_id: string
		status: 'pending'
		total_amount: number
		shipping_address: Record<string, unknown>
	},
) {
	for (let attempt = 0; attempt < 3; attempt++) {
		const orderNumber = generateOrderNumber()
		const { data, error } = await db
			.from('orders')
			.insert({ ...payload, order_number: orderNumber })
			.select('id,order_number')
			.single()

		if (!error && data) {
			return { data, error: null }
		}

		if (error?.code !== '23505') {
			return { data: null, error }
		}
	}

	return {
		data: null,
		error: { message: 'No se pudo generar un número de orden único' },
	}
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
				'id,product_id,combination_key,stock_quantity,reserved_stock,track_inventory,is_active,deleted_at',
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

		const { data: customer } = await db
			.from('customers')
			.select('id,email')
			.eq('store_id', store.id)
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

		const { data: order, error: orderError } =
			await createOrderWithRetry(db, {
				store_id: store.id,
				customer_id: customer.id,
				status: 'pending',
				total_amount: totalAmount,
				shipping_address: {
					channel: 'whatsapp',
					customerEmail: customer.email || customerEmail,
					authUserId: user.id,
				},
			})

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
		return {
			error: true,
			message: error?.message || 'No se pudo procesar el checkout',
		}
	}
}
