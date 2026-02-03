import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/store-context'
import { Database } from '@/lib/supabase/types'
import { products as staticProducts } from '@/lib/products'

type ProductRow = Database['public']['Tables']['products']['Row'] & {
	categories: Database['public']['Tables']['categories']['Row'] | null
	product_variants: Database['public']['Tables']['product_variants']['Row'][]
}

function mapRowToProduct(row: ProductRow): Product {
	// Calculate stock logic from variants
	const totalStock = row.product_variants.reduce(
		(acc, v) => acc + v.stock_quantity,
		0,
	)
	let stockStatus: 'available' | 'low' | 'sold_out' = 'available'
	if (totalStock === 0) stockStatus = 'sold_out'
	else if (totalStock < 5) stockStatus = 'low'

	// Extract sizes from variants
	const sizes = Array.from(
		new Set(row.product_variants.map((v) => v.size)),
	).sort()

	const variants = row.product_variants.map((v) => ({
		size: v.size,
		stock: v.stock_quantity,
	}))

	return {
		id: row.id,
		name: row.name,
		price: row.price,
		originalPrice: row.original_price ?? undefined,
		image: row.image,
		images: row.images,
		sizes: sizes,
		variants: variants,
		stockStatus: stockStatus,
		category: row.categories?.name || 'Uncategorized',
		description: row.description ?? undefined,
	}
}

export async function getProducts(): Promise<Product[]> {
	try {
		const supabase = await createClient()
		const { data, error } = await supabase
			.from('products')
			.select(
				`
				*,
				categories (
					name,
					slug
				),
				product_variants (
					size,
					stock_quantity
				)
			`,
			)
			.order('created_at', { ascending: false })

		if (error || !data || data.length === 0) {
			console.warn(
				'Supabase fetch failed or empty, using static data fallback:',
				error,
			)
			if (error) return staticProducts
			return []
		}

		// @ts-ignore - Supabase types for joined queries are tricky to auto-infer sometimes
		return data.map(mapRowToProduct)
	} catch (e) {
		console.error('Exception fetching products:', e)
		return staticProducts
	}
}

export async function getProduct(
	id: string,
): Promise<Product | null> {
	const supabase = await createClient()
	const { data, error } = await supabase
		.from('products')
		.select(
			`
			*,
			categories ( name, slug ),
			product_variants ( size, stock_quantity )
		`,
		)
		.eq('id', id)
		.single()

	if (error || !data) {
		// Fallback to static
		const p = staticProducts.find((p) => p.id === id)
		return p || null
	}
	// @ts-ignore
	return mapRowToProduct(data)
}

export async function getRelatedProducts(
	excludeId: string,
): Promise<Product[]> {
	try {
		const supabase = await createClient()
		const { data, error } = await supabase
			.from('products')
			.select(
				`
				*,
				categories ( name, slug ),
				product_variants ( size, stock_quantity )
			`,
			)
			.neq('id', excludeId)
			.limit(4)

		if (error || !data) {
			return staticProducts
				.filter((p) => p.id !== excludeId)
				.slice(0, 4)
		}
		// @ts-ignore
		return data.map(mapRowToProduct)
	} catch {
		return staticProducts
			.filter((p) => p.id !== excludeId)
			.slice(0, 4)
	}
}
