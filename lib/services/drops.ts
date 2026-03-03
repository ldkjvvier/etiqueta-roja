import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export interface GetAdminDropsParams {
	page?: number
	limit?: number
	status?: 'scheduled' | 'live' | 'ended' | 'all'
}

export interface AdminDrop {
	id: string
	name: string
	slug: string
	description: string | null
	cover_image: string | null
	status: 'scheduled' | 'live' | 'ended'
	start_time: string
	end_time: string | null
	created_at: string
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
		.select(
			'id,name,slug,description,cover_image,status,start_time,end_time,created_at',
			{
				count: 'exact',
			},
		)
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
		items: (data ?? []) as AdminDrop[],
		totalCount: count ?? 0,
		totalPages: Math.ceil((count ?? 0) / limit),
	}
}

export async function getAdminDropById(id: string) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const { data, error } = await db
		.from('drops')
		.select(
			'id,name,slug,description,cover_image,status,start_time,end_time,created_at',
		)
		.eq('id', id)
		.eq('store_id', store.id)
		.maybeSingle()

	if (error || !data) {
		return null
	}

	return data as AdminDrop
}
