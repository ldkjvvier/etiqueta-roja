import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/store-context'
import { Database } from '@/lib/supabase/types'
import { products as staticProducts } from '@/lib/products'

type ProductRow = Database['public']['Tables']['products']['Row']

function mapRowToProduct(row: ProductRow): Product {
	return {
		id: row.id,
		name: row.name,
		price: row.price,
		originalPrice: row.original_price ?? undefined,
		image: row.image, // Should ideally be a full URL if stored in bucket, or strict path
		images: row.images,
		sizes: row.sizes,
		stockStatus: row.stock_status as 'available' | 'low' | 'sold_out',
		category: row.category,
		description: row.description ?? undefined,
	}
}

export async function getProducts(): Promise<Product[]> {
	try {
		const supabase = await createClient()
		const { data, error } = await supabase
			.from('products')
			.select('*')
			.order('created_at', { ascending: false })

		if (error || !data || data.length === 0) {
			console.warn(
				'Supabase fetch failed or empty, using static data fallback:',
				error
			)
			// Fallback or Initial State
			// In a real migration, we might want to return staticProducts if DB is empty to "hydrate" it,
			// but for now let's just return staticProducts if connection fails to keep app running
			if (error) return staticProducts
			return [] // If just empty, return empty
		}

		return data.map(mapRowToProduct)
	} catch (e) {
		console.error('Exception fetching products:', e)
		return staticProducts
	}
}

export async function getProduct(
	id: string
): Promise<Product | null> {
	const supabase = await createClient()
	const { data, error } = await supabase
		.from('products')
		.select('*')
		.eq('id', id)
		.single()

	if (error) {
		// Fallback to static
		const p = staticProducts.find((p) => p.id === id)
		return p || null
	}
	return mapRowToProduct(data)
}

export async function getRelatedProducts(
	excludeId: string
): Promise<Product[]> {
	try {
		const supabase = await createClient()
		const { data, error } = await supabase
			.from('products')
			.select('*')
			.neq('id', excludeId)
			.limit(4)

		if (error || !data) {
			return staticProducts
				.filter((p) => p.id !== excludeId)
				.slice(0, 4)
		}
		return data.map(mapRowToProduct)
	} catch {
		return staticProducts
			.filter((p) => p.id !== excludeId)
			.slice(0, 4)
	}
}
