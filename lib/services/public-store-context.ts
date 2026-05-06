import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type PublicStoreContext = {
	id: string
	name: string
	slug: string
}

export const getPublicStoreContext = cache(
	async (): Promise<PublicStoreContext> => {
		const supabase = await createClient()
		const db = supabase as any
		const preferredSlug =
			process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG?.trim()

		let query = db
			.from('stores')
			.select('id, name, slug, created_at')
			.eq('is_active', true)
			.order('created_at', { ascending: true })

		if (preferredSlug) {
			query = query.eq('slug', preferredSlug).limit(1)
		} else {
			query = query.limit(2)
		}

		const { data, error } = await query

		if (error) {
			throw new Error(
				`Failed to resolve public store context: ${error.message}`,
			)
		}

		const rows = (data ?? []) as Array<{
			id: string
			name: string
			slug: string
			created_at: string
		}>

		if (preferredSlug) {
			const activeStore = rows[0]
			if (!activeStore) {
				throw new Error(
					`No active public store found for slug "${preferredSlug}".`,
				)
			}

			return {
				id: activeStore.id,
				name: activeStore.name,
				slug: activeStore.slug,
			}
		}

		if (rows.length === 0) {
			throw new Error('No active public store found.')
		}

		if (rows.length > 1) {
			throw new Error(
				'Multiple active public stores found. Set NEXT_PUBLIC_DEFAULT_STORE_SLUG to choose one explicitly.',
			)
		}

		const activeStore = rows[0]
		return {
			id: activeStore.id,
			name: activeStore.name,
			slug: activeStore.slug,
		}
	},
)