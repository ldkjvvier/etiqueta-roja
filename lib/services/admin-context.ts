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
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			throw new Error('Unauthorized')
		}

		const preferredSlug =
			process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG?.trim()

		let query = db
			.from('stores')
			.select(
				'id, name, slug, is_active, user_roles!inner(user_id, role)',
			)
			.eq('is_active', true)
			.eq('user_roles.user_id', user.id)
			.in('user_roles.role', ['super_admin', 'store_admin'])

		if (preferredSlug) {
			query = query.eq('slug', preferredSlug)
		}

		const { data, error } = await query

		if (error) {
			throw new Error(
				`Failed to resolve admin store context: ${error.message}`,
			)
		}

		const rows = (data ?? []) as Array<{
			id: string
			name: string
			slug: string
			is_active: boolean
		}>

		const activeStore = rows[0]

		if (!activeStore) {
			const baseMessage = preferredSlug
				? `No admin access to active store "${preferredSlug}" for current user.`
				: 'Current user has no admin access to any active store.'
			throw new Error(
				`${baseMessage} Assign role store_admin or super_admin in user_roles.`,
			)
		}

		return {
			id: activeStore.id,
			name: activeStore.name,
			slug: activeStore.slug,
		}
	},
)
