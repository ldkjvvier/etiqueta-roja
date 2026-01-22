'use server'

import { createClient } from '@/lib/supabase/server'

export async function incrementProductView(productId: string) {
	const supabase = await createClient()

	try {
		// Try calling RPC function first (Atomic)
		const { error: rpcError } = await supabase.rpc(
			'increment_product_views',
			{ product_id: productId },
		)

		if (!rpcError) return

		// Fallback: Read-Modify-Write (If RPC doesn't exist but column does)
		const { data: product, error: fetchError } = await supabase
			.from('products')
			.select('views')
			.eq('id', productId)
			.single()

		if (fetchError) return // Probably column doesn't exist

		const currentViews = (product as any).views || 0

		await supabase
			.from('products')
			.update({ views: currentViews + 1 } as any)
			.eq('id', productId)
	} catch (e) {
		// Silent fail for analytics
		console.error('Error incrementing view:', e)
	}
}
