import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/data/admin-context'

type DataResult<T> = { data: T | null; error: string | null }

export type DashboardMetrics = {
	total_orders_today: number
	total_sales_today: number
	total_views_today: number
	total_products_active: number
	total_customers: number
	low_stock_count: number
}

export type RecentProduct = {
	id: string
	name: string
	slug: string
	status: string
	base_price: number
	main_image: string
	created_at: string
}

export type TopViewedProduct = {
	product_id: string
	views: number
	products: { name: string; slug: string; main_image: string } | null
}

export async function getDashboardMetrics(): Promise<
	DataResult<DashboardMetrics>
> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()
	const today = new Date().toISOString().split('T')[0]

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const [metricsRes, productsRes, customersRes, lowStockRes] =
		await Promise.all([
			db
				.from('daily_metrics')
				.select('total_orders, total_sales, total_views')
				.eq('store_id', storeId)
				.eq('date', today)
				.maybeSingle(),
			db
				.from('products')
				.select('id', { count: 'exact', head: true })
				.eq('store_id', storeId)
				.eq('status', 'active')
				.is('deleted_at', null),
			db
				.from('customers')
				.select('id', { count: 'exact', head: true })
				.eq('store_id', storeId)
				.is('deleted_at', null),
			db
				.from('product_variants')
				.select('id', { count: 'exact', head: true })
				.eq('is_active', true)
				.is('deleted_at', null)
				.lt('stock_quantity', 5),
		])

	return {
		data: {
			total_orders_today: metricsRes.data?.total_orders ?? 0,
			total_sales_today: metricsRes.data?.total_sales ?? 0,
			total_views_today: metricsRes.data?.total_views ?? 0,
			total_products_active: productsRes.count ?? 0,
			total_customers: customersRes.count ?? 0,
			low_stock_count: lowStockRes.count ?? 0,
		},
		error: null,
	}
}

export async function getRecentProducts(
	limit = 5,
): Promise<DataResult<RecentProduct[]>> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('products')
		.select('id, name, slug, status, base_price, main_image, created_at')
		.eq('store_id', storeId)
		.is('deleted_at', null)
		.order('created_at', { ascending: false })
		.limit(limit)

	if (error) {
		console.error('[getRecentProducts]', error)
		return { data: null, error: 'Error al cargar productos recientes' }
	}
	return { data, error: null }
}

export async function getTopViewedProducts(
	limit = 5,
): Promise<DataResult<TopViewedProduct[]>> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()
	const today = new Date().toISOString().split('T')[0]
	const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split('T')[0]

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('product_views_daily')
		.select('product_id, views, products(name, slug, main_image)')
		.eq('store_id', storeId)
		.gte('date', from)
		.lte('date', today)
		.order('views', { ascending: false })
		.limit(limit)

	if (error) {
		console.error('[getTopViewedProducts]', error)
		return { data: null, error: 'Error al cargar productos más vistos' }
	}
	return { data: data as TopViewedProduct[], error: null }
}

export async function getAdminDashboardBundle() {
	const [metrics, recentProducts, topProducts] = await Promise.all([
		getDashboardMetrics(),
		getRecentProducts(),
		getTopViewedProducts(),
	])
	return { metrics, recentProducts, topProducts }
}
