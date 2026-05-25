import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Customer } from '@/types/database.types'

const CUSTOMER_SELECT =
	'id, store_id, auth_user_id, email, first_name, last_name, phone, total_spent, deleted_at, created_at'

/**
 * Verifies the current user is authenticated.
 * Redirects to /admin/login if not. Safe to call in Server Components and Actions.
 */
export async function requireAuth() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/admin/login')
	}

	return user
}

/**
 * Verifies the current user is a store admin or super_admin for the given store.
 * Uses the `is_store_admin` RPC (SECURITY DEFINER) to check the role.
 * Throws 'Unauthorized' if the check fails — catch in layouts/actions and redirect.
 */
export async function requireStoreAdmin(storeId: string) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/admin/login')
	}

	const { data: roleRow, error: roleError } = await supabase
		.from('user_roles')
		.select('role')
		.eq('user_id', user.id)
		.eq('store_id', storeId)
		.in('role', ['super_admin', 'store_admin'])
		.maybeSingle()

	if (roleError || !roleRow) {
		throw new Error('Unauthorized')
	}

	return user
}

/**
 * Verifies the current user has a non-deleted customer profile in the given store.
 * Throws if not found — caller decides whether to create or reject.
 */
export async function requireCustomer(
	storeId: string,
): Promise<Customer> {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Authentication required')
	}

	const { data: customer, error } = await supabase
		.from('customers')
		.select(CUSTOMER_SELECT)
		.eq('store_id', storeId)
		.eq('auth_user_id', user.id)
		.is('deleted_at', null)
		.single()

	if (error || !customer) {
		throw new Error('Customer profile not found')
	}

	return customer
}
