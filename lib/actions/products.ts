'use server'

import { createClient } from '@/lib/supabase/server'
import { hardDeleteProductV3 } from '@/lib/actions/products-admin'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export async function deleteProduct(id: string) {
	const result = await hardDeleteProductV3(id)
	return {
		message: result.message,
		error: result.error,
	}
}

export async function validateCartStock(
	items: { id: string; size: string; variantId?: string }[],
) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()
	const normalize = (value: string) =>
		(value || '').trim().toLowerCase().replace(/\s+/g, '-')
	const productIds = Array.from(new Set(items.map((i) => i.id)))

	if (productIds.length === 0) return {}

	const { data: variants, error } = await supabase
		.from('product_variants')
		.select(
			'id, product_id, combination_key, stock_quantity, reserved_stock, track_inventory, product:products!inner(store_id,deleted_at,status)',
		)
		.in('product_id', productIds)
		.eq('product.store_id', store.id)
		.eq('product.status', 'active')
		.is('product.deleted_at', null)
		.eq('is_active', true)
		.is('deleted_at', null)

	if (error) {
		console.error('Error validating stock:', error)
		return {}
	}

	// Map results for easy lookup:
	// - "product_id-variant:<variant_id>" -> stock
	// - "product_id-size" -> stock (legacy fallback)
	const stockMap: Record<string, number> = {}
	;(variants as any[]).forEach((v: any) => {
		const size = (v.combination_key || '').split(':')[1] || ''
		const available =
			v.track_inventory === false
				? Number.MAX_SAFE_INTEGER
				: Math.max(
						(v.stock_quantity || 0) - (v.reserved_stock || 0),
						0,
					)

		stockMap[`${v.product_id}-variant:${v.id}`] = available
		stockMap[`${v.product_id}-${normalize(size)}`] = available
	})

	return stockMap
}
