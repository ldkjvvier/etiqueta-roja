import { createClient } from '@/lib/supabase/server'
import {
	getPublicStoreContext,
	getAdminStoreContext,
} from '@/lib/data/admin-context'

export type Drop = {
	id: string
	store_id: string
	name: string
	slug: string
	description: string | null
	cover_image: string | null
	start_time: string
	end_time: string | null
	status: 'scheduled' | 'live' | 'ended'
	created_at: string
	updated_at: string
}

export type AdminDrop = Drop & { _product_count: number }
export type DropOption = Pick<Drop, 'id' | 'name' | 'slug' | 'status'>
export type LinkedDropSummary = Pick<Drop, 'id' | 'name' | 'slug' | 'status' | 'start_time' | 'end_time'>

type DataResult<T> = { data: T | null; error: string | null }

export async function getAdminDrops(): Promise<DataResult<AdminDrop[]>> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('drops')
		.select(
			`
      id, store_id, name, slug, description, cover_image,
      start_time, end_time, status, created_at, updated_at,
      products(count)
    `,
		)
		.eq('store_id', storeId)
		.order('start_time', { ascending: false })

	if (error) {
		console.error('[getAdminDrops]', error)
		return { data: null, error: 'Error al cargar drops' }
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const mapped = (data ?? []).map((d: any) => ({
		...d,
		_product_count: d.products?.[0]?.count ?? 0,
		products: undefined,
	}))

	return { data: mapped, error: null }
}

export async function getAdminDropById(id: string): Promise<DataResult<Drop>> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('drops')
		.select(
			'id, store_id, name, slug, description, cover_image, start_time, end_time, status, created_at, updated_at',
		)
		.eq('id', id)
		.eq('store_id', storeId)
		.single()

	if (error) {
		console.error('[getAdminDropById]', error)
		return { data: null, error: 'Drop no encontrado' }
	}
	return { data, error: null }
}

export async function getDropOptions(): Promise<DataResult<DropOption[]>> {
	const supabase = await createClient()
	const { storeId } = await getPublicStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('drops')
		.select('id, name, slug, status')
		.eq('store_id', storeId)
		.in('status', ['scheduled', 'live'])
		.order('start_time', { ascending: false })

	if (error) {
		console.error('[getDropOptions]', error)
		return { data: null, error: 'Error al cargar drops' }
	}
	return { data, error: null }
}

export async function getHeroLinkedDropSummary(): Promise<
	DataResult<LinkedDropSummary | null>
> {
	const supabase = await createClient()
	const { storeId } = await getPublicStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('drops')
		.select('id, name, slug, status, start_time, end_time')
		.eq('store_id', storeId)
		.eq('status', 'live')
		.order('start_time', { ascending: false })
		.limit(1)
		.maybeSingle()

	if (error) {
		console.error('[getHeroLinkedDropSummary]', error)
		return { data: null, error: 'Error al cargar drop hero' }
	}
	return { data, error: null }
}
