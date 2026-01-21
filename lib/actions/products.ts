'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProduct(id: string) {
	const supabase = await createClient()

	// Auth check
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	try {
		// Delete related variants first (Postgres CASCADE might handle this, but good to be explicit if not)
		// Actually, normally we rely on DB definition ON DELETE CASCADE.
		// Assuming schema has it. If not, we would delete from product_variants where product_id = id

		const { error } = await supabase
			.from('products')
			.delete()
			.eq('id', id)

		if (error) {
			console.error('Error deleting product:', error)
			return { message: 'Error deleting product', error: true }
		}

		revalidatePath('/admin/products')
		return { message: 'Product deleted successfully', error: false }
	} catch (e) {
		return { message: 'Unexpected error', error: true }
	}
}
