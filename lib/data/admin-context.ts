import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AdminStoreContext = {
	storeId: string
	userId: string
	role: 'super_admin' | 'store_admin'
}

export type PublicStoreContext = {
	storeId: string
	storeSlug: string
}

export const getAdminStoreContext = cache(
	async (): Promise<AdminStoreContext> => {
		const supabase = await createClient()

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()
		if (authError || !user) redirect('/admin/login')

		const storeSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG!
		const storeId = process.env.NEXT_PUBLIC_STORE_ID!

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const db = supabase as any
		const { data: role, error: roleError } = await db
			.from('user_roles')
			.select('role')
			.eq('user_id', user.id)
			.eq('store_id', storeId)
			.in('role', ['super_admin', 'store_admin'])
			.single()

		if (roleError || !role) redirect('/admin/login')

		return {
			storeId,
			userId: user.id,
			role: role.role as 'super_admin' | 'store_admin',
		}
	},
)

export const getPublicStoreContext = cache(
	async (): Promise<PublicStoreContext> => {
		const storeSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG!
		const storeId = process.env.NEXT_PUBLIC_STORE_ID!
		return { storeId, storeSlug }
	},
)
