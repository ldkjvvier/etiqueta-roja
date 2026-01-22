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

		// Fallback: This part becomes deprecated if we move completely to the new system
		// but we can keep it as a backup for the 'views' column on products table
		// for now, we just log the error if RPC fails
		console.error('RPC increment_product_view failed:', rpcError)
	} catch (e) {
		// Silent fail for analytics
		console.error('Error incrementing view:', e)
	}
}
