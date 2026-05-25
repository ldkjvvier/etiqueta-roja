import { createClient } from '@/lib/supabase/server'
import type {
	DataResult,
	Store,
	SiteConfig,
	UserRole,
} from '@/types/database.types'

export async function getStoreBySlug(slug: string): Promise<DataResult<Store>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data, error } = await db
		.from('stores')
		.select('id, name, slug, is_active, created_at')
		.eq('slug', slug)
		.eq('is_active', true)
		.single()

	if (error) {
		console.error('[getStoreBySlug]', error)
		return { data: null, error: 'Tienda no encontrada' }
	}

	return { data: data as Store, error: null }
}

export async function getStoreConfig(
	storeId: string,
	keys?: string[],
): Promise<DataResult<SiteConfig[]>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	let query = db
		.from('site_config')
		.select(
			'id, store_id, key, value, is_active, visibility, description, updated_by, created_at, updated_at',
		)
		.eq('store_id', storeId)
		.eq('is_active', true)

	if (keys && keys.length > 0) {
		query = query.in('key', keys)
	}

	const { data, error } = await query

	if (error) {
		console.error('[getStoreConfig]', error)
		return { data: null, error: 'Error al cargar configuración' }
	}

	return { data: (data as SiteConfig[]) ?? [], error: null }
}

export async function getUserRole(
	userId: string,
	storeId: string,
): Promise<DataResult<UserRole | null>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data, error } = await db
		.from('user_roles')
		.select('user_id, store_id, role')
		.eq('user_id', userId)
		.eq('store_id', storeId)
		.maybeSingle()

	if (error) {
		console.error('[getUserRole]', error)
		return { data: null, error: 'Error al verificar rol' }
	}

	return { data: (data as UserRole) ?? null, error: null }
}
