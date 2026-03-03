import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type AdminStoreContext = {
	id: string
	name: string
	slug: string
}

export const getAdminStoreContext = cache(
	async (): Promise<AdminStoreContext> => {
		const supabase = await createClient()
		const db = supabase as any
		const preferredSlug =
			process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG?.trim()

		if (!preferredSlug) {
			throw new Error(
				'Missing NEXT_PUBLIC_DEFAULT_STORE_SLUG. Set this env var explicitly to prevent unintended store fallback in production.',
			)
		}

		const { data, error } = await db
			.from('stores')
			.select('id, name, slug')
			.eq('slug', preferredSlug)
			.eq('is_active', true)
			.maybeSingle()

		if (error || !data) {
			throw new Error(
				`Store not found or inactive for NEXT_PUBLIC_DEFAULT_STORE_SLUG="${preferredSlug}". Create/activate that store before starting the app.`,
			)
		}

		return data
	},
)
