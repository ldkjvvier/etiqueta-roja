import { createClient } from '@/lib/supabase/server'
import {
	getPublicStoreContext,
	getAdminStoreContext,
} from '@/lib/data/admin-context'

export type Category = {
	id: string
	store_id: string
	name: string
	slug: string
	description: string | null
	image_url: string | null
	created_at: string
	updated_at: string
}

export type CategoryOption = Pick<Category, 'id' | 'name' | 'slug'>

type DataResult<T> = { data: T | null; error: string | null }

export async function getCategories(): Promise<DataResult<Category[]>> {
	const supabase = await createClient()
	const { storeId } = await getPublicStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('categories')
		.select(
			'id, store_id, name, slug, description, image_url, created_at, updated_at',
		)
		.eq('store_id', storeId)
		.order('name')

	if (error) {
		console.error('[getCategories]', error)
		return { data: null, error: 'Error al cargar categorías' }
	}
	return { data, error: null }
}

export async function getCategoryById(
	id: string,
): Promise<DataResult<Category>> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('categories')
		.select(
			'id, store_id, name, slug, description, image_url, created_at, updated_at',
		)
		.eq('id', id)
		.eq('store_id', storeId)
		.single()

	if (error) {
		console.error('[getCategoryById]', error)
		return { data: null, error: 'Categoría no encontrada' }
	}
	return { data, error: null }
}

export async function getCategoryOptions(): Promise<
	DataResult<CategoryOption[]>
> {
	const supabase = await createClient()
	const { storeId } = await getPublicStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('categories')
		.select('id, name, slug')
		.eq('store_id', storeId)
		.order('name')

	if (error) {
		console.error('[getCategoryOptions]', error)
		return { data: null, error: 'Error al cargar opciones de categoría' }
	}
	return { data, error: null }
}
