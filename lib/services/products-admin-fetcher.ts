'use server'

import { createClient } from '@/lib/supabase/server'

export interface Category {
	id: string
	name: string
}

export async function getCategories() {
	const supabase = await createClient()
	const { data } = await supabase
		.from('categories')
		.select('id, name')
	return (data as Category[]) || []
}

export async function getProductById(id: string) {
	const supabase = await createClient()
	const { data: product, error } = await supabase
		.from('products')
		.select(
			`
            *,
            variants:product_variants(*)
        `,
		)
		.eq('id', id)
		.single()

	if (error) return null
	return product
}
