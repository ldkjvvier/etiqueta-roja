import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export async function getDashboardStats() {
	const supabase = await createClient()

	// 1. Total Products
	const { count: productsCount, error: productsError } =
		await supabase
			.from('products')
			.select('*', { count: 'exact', head: true })

	// 2. Total Categories
	const { count: categoriesCount, error: categoriesError } =
		await supabase
			.from('categories')
			.select('*', { count: 'exact', head: true })

	// 3. Inventory Value & Stock Issues
	// We need to fetch variants to calculate total stock and identify low stock items
	const { data: variants } = await supabase.from('product_variants')
		.select(`
            stock_quantity,
            product_id,
            product:products (
                id,
                name,
                price
            )
        `)

	let totalStockItems = 0
	let totalInventoryValue = 0
	let lowStockCount = 0 // Products with total stock < 5
	let outOfStockCount = 0 // Products with 0 stock

	// Group variants by product to check stock levels per product
	const productStockMap = new Map<string, number>()

	// We also need prices which are on the product, joined above
	const productPriceMap = new Map<string, number>()

	variants?.forEach((v: any) => {
		const qty = v.stock_quantity || 0
		totalStockItems += qty

		// Calculate value
		const price = v.product?.price || 0
		totalInventoryValue += price * qty

		// Map for aggregation
		const pId = v.product_id
		const currentStock = productStockMap.get(pId) || 0
		productStockMap.set(pId, currentStock + qty)
	})

	// Analyze stock levels
	// Note: This only counts products THAT HAVE VARIANTS. Products without variants (if any) are skipped.
	// Assuming all products have at least one variant created.
	for (const stock of productStockMap.values()) {
		if (stock === 0) outOfStockCount++
		else if (stock < 5) lowStockCount++
	}

	return {
		productsCount: productsCount || 0,
		categoriesCount: categoriesCount || 0,
		totalStockItems,
		totalInventoryValue,
		lowStockCount,
		outOfStockCount,
	}
}

export async function getRecentProducts() {
	const supabase = await createClient()

	const { data } = await supabase
		.from('products')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(5)

	return data || []
}

export async function getTopViewedProducts() {
	const supabase = await createClient()

	// Try to select with ordering by views
	// If column doesn't exist, this might throw or return error.
	// We handle it gracefully.
	try {
		const { data, error } = await supabase
			.from('products')
			.select('*')
			// @ts-ignore - 'views' might not be in types yet
			.order('views', { ascending: false })
			.limit(5)

		if (error) {
			// If error (likely column missing), return nothing or fallback
			console.warn(
				'Could not fetch top viewed products (column might be missing):',
				error.message,
			)
			return []
		}

		return data || []
	} catch (e) {
		return []
	}
}
