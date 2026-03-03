import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export async function getDashboardMetrics() {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const [
		productsRes,
		categoriesRes,
		ordersRes,
		customersRes,
		variantsRes,
		dailyMetricsRes,
		viewsRes,
	] = await Promise.all([
		db
			.from('products')
			.select('id', { count: 'exact', head: true })
			.eq('store_id', store.id)
			.is('deleted_at', null),
		db
			.from('categories')
			.select('id', { count: 'exact', head: true })
			.eq('store_id', store.id),
		db
			.from('orders')
			.select('id', { count: 'exact', head: true })
			.eq('store_id', store.id),
		db
			.from('customers')
			.select('id', { count: 'exact', head: true })
			.eq('store_id', store.id)
			.is('deleted_at', null),
		db
			.from('product_variants')
			.select(
				'stock_quantity,reserved_stock,low_stock_threshold,product:products!inner(store_id,deleted_at)',
			)
			.eq('product.store_id', store.id)
			.is('product.deleted_at', null)
			.eq('is_active', true)
			.is('deleted_at', null),
		db
			.from('daily_metrics')
			.select('date,total_sales,total_orders,total_views')
			.eq('store_id', store.id)
			.order('date', { ascending: false })
			.limit(7),
		db
			.from('product_views_daily')
			.select(
				'product_id,views,product:products!inner(name,main_image,base_price,store_id,deleted_at)',
			)
			.eq('store_id', store.id)
			.gte(
				'date',
				new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
					.toISOString()
					.slice(0, 10),
			),
	])

	const variants = variantsRes.data ?? []
	const stockSummary = variants.reduce(
		(
			acc: {
				available: number
				reserved: number
				lowStock: number
				outOfStock: number
			},
			variant: any,
		) => {
			const available = Math.max(
				(variant.stock_quantity || 0) - (variant.reserved_stock || 0),
				0,
			)
			acc.available += available
			acc.reserved += variant.reserved_stock || 0
			if (available === 0) {
				acc.outOfStock += 1
			} else if (available <= (variant.low_stock_threshold || 0)) {
				acc.lowStock += 1
			}
			return acc
		},
		{ available: 0, reserved: 0, lowStock: 0, outOfStock: 0 },
	)

	const topViewsMap = new Map<string, any>()
	for (const row of viewsRes.data ?? []) {
		const key = row.product_id
		const current = topViewsMap.get(key) ?? {
			id: row.product_id,
			name: (row.product as any)?.name,
			main_image: (row.product as any)?.main_image,
			base_price: (row.product as any)?.base_price,
			views: 0,
		}
		current.views += row.views || 0
		topViewsMap.set(key, current)
	}

	const topProducts = Array.from(topViewsMap.values())
		.sort((a, b) => b.views - a.views)
		.slice(0, 5)

	return {
		productsCount: productsRes.count ?? 0,
		categoriesCount: categoriesRes.count ?? 0,
		ordersCount: ordersRes.count ?? 0,
		customersCount: customersRes.count ?? 0,
		totalStockItems: stockSummary.available,
		reservedStockItems: stockSummary.reserved,
		lowStockCount: stockSummary.lowStock,
		outOfStockCount: stockSummary.outOfStock,
		dailyMetrics: dailyMetricsRes.data ?? [],
		topProducts,
	}
}

export async function getRecentProducts(limit = 5) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()
	const { data } = await db
		.from('products')
		.select('id,name,base_price,main_image,created_at')
		.eq('store_id', store.id)
		.is('deleted_at', null)
		.order('created_at', { ascending: false })
		.limit(limit)

	return data ?? []
}
