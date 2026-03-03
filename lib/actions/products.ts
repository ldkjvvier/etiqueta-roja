'use server'

import { createClient } from '@/lib/supabase/server'
import { archiveProductV3 } from '@/lib/actions/products-admin'

export async function deleteProduct(id: string) {
	const result = await archiveProductV3(id)
	return {
		message: result.message,
		error: result.error,
	}
}

export async function validateCartStock(
	items: { id: string; size: string }[],
) {
	const supabase = await createClient()
	const normalize = (value: string) =>
		(value || '').trim().toLowerCase().replace(/\s+/g, '-')
	const productIds = Array.from(new Set(items.map((i) => i.id)))

	if (productIds.length === 0) return {}

	const { data: variants, error } = await supabase
		.from('product_variants')
		.select(
			'product_id, combination_key, stock_quantity, reserved_stock',
		)
		.in('product_id', productIds)

	if (error) {
		console.error('Error validating stock:', error)
		return {}
	}

	// Map results for easy lookup: "product_id-size" -> stock
	const stockMap: Record<string, number> = {}
	;(variants as any[]).forEach((v: any) => {
		const size = (v.combination_key || '').split(':')[1] || ''
		stockMap[`${v.product_id}-${normalize(size)}`] = Math.max(
			(v.stock_quantity || 0) - (v.reserved_stock || 0),
			0,
		)
	})

	return stockMap
}
