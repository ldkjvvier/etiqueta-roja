import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export interface GetAdminCustomersParams {
	page?: number
	limit?: number
	fromDate?: string
	toDate?: string
}

export async function getAdminCustomers({
	page = 1,
	limit = 20,
	fromDate,
	toDate,
}: GetAdminCustomersParams) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()
	const from = (page - 1) * limit
	const to = from + limit - 1

	let request = db
		.from('customers')
		.select('id,email,first_name,last_name,total_spent,created_at', {
			count: 'exact',
		})
		.eq('store_id', store.id)
		.is('deleted_at', null)

	if (fromDate) {
		request = request.gte('created_at', `${fromDate}T00:00:00`)
	}
	if (toDate) {
		request = request.lte('created_at', `${toDate}T23:59:59`)
	}

	const { data, error, count } = await request
		.order('created_at', { ascending: false })
		.range(from, to)

	if (error) {
		console.error('Error loading customers:', error)
		return { items: [], totalCount: 0, totalPages: 0 }
	}

	return {
		items: data ?? [],
		totalCount: count ?? 0,
		totalPages: Math.ceil((count ?? 0) / limit),
	}
}
