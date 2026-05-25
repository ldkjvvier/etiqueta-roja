'use server'

import { createClient } from '@/lib/supabase/server'

export async function incrementProductView(productId: string): Promise<void> {
	const supabase = await createClient()
	const storeId = process.env.NEXT_PUBLIC_STORE_ID!
	const today = new Date().toISOString().split('T')[0]

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	await db.rpc('increment_product_view', {
		p_store_id: storeId,
		p_product_id: productId,
		p_date: today,
	})
}
