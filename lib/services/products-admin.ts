'use server'

import { createClient } from '@/lib/supabase/server'

export type AdminProduct = {
	id: string
	name: string
	price: number
	original_price: number | null
	image: string
	category: { name: string } | null
	variants_count: number
	total_stock: number
}

interface GetAdminProductsParams {
	page?: number
	limit?: number
	query?: string
}

export async function getAdminProducts({
	page = 1,
	limit = 10,
	query = '',
}: GetAdminProductsParams) {
	const supabase = await createClient()
	const from = (page - 1) * limit
	const to = from + limit - 1

	let baseQuery = supabase.from('products').select(
		`
            id,
            name,
            price,
            original_price,
            image,
            category:categories(name),
            variants:product_variants(count),
            stock_data:product_variants(stock_quantity)
        `,
		{ count: 'exact' },
	)

	if (query) {
		baseQuery = baseQuery.ilike('name', `%${query}%`)
	}

	const { data, error, count } = await baseQuery
		.range(from, to)
		.order('created_at', { ascending: false })

	if (error) {
		console.error('Error fetching admin products:', error)
		return { products: [], totalCount: 0, totalPages: 0 }
	}

	// Transform data to match AdminProduct type purely for UI consumption
	// Note: Suapbase returns arrays for joined one-to-many.
	// We aggregate stock manually here since SQL aggregation via PostgREST is tricky without a View/RPC.
	const products: AdminProduct[] = data.map((item: any) => {
		const totalStock =
			item.stock_data?.reduce(
				(acc: number, curr: { stock_quantity: number }) =>
					acc + curr.stock_quantity,
				0,
			) || 0
		const variantsCount = item.variants?.[0]?.count || 0 // 'count' aggregation trick if supported, else check length
		// Actually Supabase select count on join relation returns [{count: N}]

		return {
			id: item.id,
			name: item.name,
			price: item.price,
			original_price: item.original_price,
			image: item.image,
			category: item.category, // It's single object due to select category:categories(...)
			variants_count: item.stock_data?.length || 0,
			total_stock: totalStock,
		}
	})

	return {
		products,
		totalCount: count || 0,
		totalPages: Math.ceil((count || 0) / limit),
	}
}
