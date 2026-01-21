import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

export type Category =
	Database['public']['Tables']['categories']['Row']

export const getCategories = async () => {
	const supabase = await createClient()

	// Sort by name or created_at? Let's do name for now for dropdowns
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.order('name')

	if (error) {
		console.error('Error fetching categories:', error)
		return []
	}

	return data
}

export const getCategoryById = async (id: string) => {
	const supabase = await createClient()
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.eq('id', id)
		.single()

	if (error) return null
	return data
}
