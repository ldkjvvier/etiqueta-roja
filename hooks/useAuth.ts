'use client'

import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { UserRoleValue } from '@/types/database.types'

type AuthState = {
	user: User | null
	session: Session | null
	isLoading: boolean
	isAuthenticated: boolean
	role: UserRoleValue | null
	isAdmin: boolean
	isCustomer: boolean
}

const STORE_SLUG = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG ?? ''

export function useAuth(): AuthState {
	const [state, setState] = useState<AuthState>({
		user: null,
		session: null,
		isLoading: true,
		isAuthenticated: false,
		role: null,
		isAdmin: false,
		isCustomer: false,
	})

	useEffect(() => {
		const supabase = createClient()

		const loadRole = async (
			userId: string,
		): Promise<UserRoleValue | null> => {
			if (!STORE_SLUG) return null

			const storeResult = await supabase
				.from('stores')
				.select('id')
				.eq('slug', STORE_SLUG)
				.single()

			const store = storeResult.data as { id: string } | null
			if (!store) return null

			const roleResult = await supabase
				.from('user_roles')
				.select('role')
				.eq('user_id', userId)
				.eq('store_id', store.id)
				.single()

			const roleRow = roleResult.data as { role: string } | null
			return (roleRow?.role as UserRoleValue) ?? null
		}

		const applySession = async (session: Session | null) => {
			const user = session?.user ?? null
			let role: UserRoleValue | null = null

			if (user) {
				role = await loadRole(user.id)
			}

			setState({
				user,
				session,
				isLoading: false,
				isAuthenticated: !!user,
				role,
				isAdmin: role === 'super_admin' || role === 'store_admin',
				isCustomer: role === 'customer',
			})
		}

		supabase.auth.getSession().then(({ data: { session } }) => {
			void applySession(session)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			void applySession(session)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	return state
}
