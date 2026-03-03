import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export type Category = {
	id: string
	name: string
	slug: string
	description: string | null
	image_url: string | null
	created_at: string
}

export const getCategories = async () => {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	const { data, error } = await supabase
		.from('categories')
		.select('id,name,slug,description,image_url,created_at')
		.eq('store_id', store.id)
		.order('name', { ascending: true })

	if (error) {
		console.error('Error fetching categories:', error)
		return []
	}

	return data
}

export const getCategoryById = async (id: string) => {
	const supabase = await createClient()
	const store = await getAdminStoreContext()
	const { data, error } = await supabase
		.from('categories')
		.select('id,name,slug,description,image_url,created_at')
		.eq('id', id)
		.eq('store_id', store.id)
		.maybeSingle()

	if (error) return null
	return data
}
