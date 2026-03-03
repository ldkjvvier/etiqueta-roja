'use server'

import { createClient } from '@/lib/supabase/server'

export async function incrementProductView(productId: string) {
	const supabase = await createClient()

	try {
		// Try calling RPC function first (Atomic)
		const { error: rpcError } = await supabase.rpc(
			'increment_product_view',
			{ p_product_id: productId } as any,
		)

		if (!rpcError) return

		// Si falla el RPC de analytics, registramos error sin romper la UX.
		console.error('RPC increment_product_view failed:', rpcError)
	} catch (e) {
		// Silent fail for analytics
		console.error('Error incrementing view:', e)
	}
}
