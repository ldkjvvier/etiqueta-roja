import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export interface GetAdminDropsParams {
	page?: number
	limit?: number
	status?: 'scheduled' | 'live' | 'ended' | 'all'
}

export async function getAdminDrops({
	page = 1,
	limit = 20,
	status = 'all',
}: GetAdminDropsParams) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()
	const from = (page - 1) * limit
	const to = from + limit - 1

	let request = db
		.from('drops')
		.select('id,name,slug,status,start_time,end_time,created_at', {
			count: 'exact',
		})
		.eq('store_id', store.id)

	if (status !== 'all') {
		request = request.eq('status', status)
	}

	const { data, error, count } = await request
		.order('start_time', { ascending: false })
		.range(from, to)

	if (error) {
		console.error('Error loading drops:', error)
		return { items: [], totalCount: 0, totalPages: 0 }
	}

	return {
		items: data ?? [],
		totalCount: count ?? 0,
		totalPages: Math.ceil((count ?? 0) / limit),
	}
}
