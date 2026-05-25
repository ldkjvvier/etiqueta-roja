import { createClient } from '@/lib/supabase/server'
import type {
	DataResult,
	Customer,
	InsertCustomer,
	UpdateCustomer,
} from '@/types/database.types'

const CUSTOMER_SELECT =
	'id, store_id, auth_user_id, email, first_name, last_name, phone, total_spent, deleted_at, created_at'

export async function getOrCreateCustomer(
	storeId: string,
	authUserId: string,
	email: string,
): Promise<DataResult<Customer>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data: existing } = await db
		.from('customers')
		.select(CUSTOMER_SELECT)
		.eq('store_id', storeId)
		.eq('auth_user_id', authUserId)
		.is('deleted_at', null)
		.single()

	if (existing) {
		return { data: existing as Customer, error: null }
	}

	const insertData: InsertCustomer = {
		store_id: storeId,
		auth_user_id: authUserId,
		email,
	}

	const { data: created, error } = await db
		.from('customers')
		.insert(insertData)
		.select(CUSTOMER_SELECT)
		.single()

	if (error) {
		console.error('[getOrCreateCustomer]', error)

		if (error.code === '23505') {
			const { data: raceCustomer } = await db
				.from('customers')
				.select(CUSTOMER_SELECT)
				.eq('store_id', storeId)
				.eq('auth_user_id', authUserId)
				.is('deleted_at', null)
				.single()

			if (raceCustomer) return { data: raceCustomer as Customer, error: null }
		}

		return { data: null, error: 'Error al crear perfil de cliente' }
	}

	return { data: created as Customer, error: null }
}

export async function getCustomerProfile(
	authUserId: string,
): Promise<DataResult<Customer>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data, error } = await db
		.from('customers')
		.select(CUSTOMER_SELECT)
		.eq('auth_user_id', authUserId)
		.is('deleted_at', null)
		.single()

	if (error) {
		console.error('[getCustomerProfile]', error)
		return { data: null, error: 'Perfil no encontrado' }
	}

	return { data: data as Customer, error: null }
}

export async function updateCustomerProfile(
	customerId: string,
	data: UpdateCustomer,
): Promise<DataResult<Customer>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data: updated, error } = await db
		.from('customers')
		.update(data)
		.eq('id', customerId)
		.is('deleted_at', null)
		.select(CUSTOMER_SELECT)
		.single()

	if (error) {
		console.error('[updateCustomerProfile]', error)
		return { data: null, error: 'Error al actualizar perfil' }
	}

	return { data: updated as Customer, error: null }
}
