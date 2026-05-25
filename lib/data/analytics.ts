import { createClient } from '@/lib/supabase/server'
import type {
	DataResult,
	DailyMetrics,
	TopProductRow,
} from '@/types/database.types'

export async function incrementProductView(
	storeId: string,
	productId: string,
): Promise<DataResult<null>> {
	const supabase = await createClient()

	// storeId is required for RLS context — the RPC resolves it internally
	void storeId

	const { error } = await supabase.rpc('increment_product_view', {
		p_product_id: productId,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any)

	if (error) {
		console.error('[incrementProductView]', error)
		return { data: null, error: 'Error al registrar visita' }
	}

	return { data: null, error: null }
}

export async function getDailyMetrics(
	storeId: string,
	from: Date,
	to: Date,
): Promise<DataResult<DailyMetrics[]>> {
	const supabase = await createClient()

	const { data, error } = await supabase
		.from('daily_metrics')
		.select('store_id, date, total_views, total_sales, total_orders')
		.eq('store_id', storeId)
		.gte('date', from.toISOString().slice(0, 10))
		.lte('date', to.toISOString().slice(0, 10))
		.order('date', { ascending: true })

	if (error) {
		console.error('[getDailyMetrics]', error)
		return { data: null, error: 'Error al cargar métricas' }
	}

	return { data: data ?? [], error: null }
}

// Uses the denormalized total_views on products for efficiency.
// For per-day breakdown use getDailyMetrics + product_views_daily.
export async function getTopProducts(
	storeId: string,
	limit = 5,
): Promise<DataResult<TopProductRow[]>> {
	const supabase = await createClient()

	const result = await supabase
		.from('products')
		.select('id, name, main_image, base_price, total_views')
		.eq('store_id', storeId)
		.eq('status', 'active')
		.is('deleted_at', null)
		.not('total_views', 'is', null)
		.order('total_views', { ascending: false })
		.limit(limit)

	if (result.error) {
		console.error('[getTopProducts]', result.error)
		return { data: null, error: 'Error al cargar productos más vistos' }
	}

	type ProductRow = {
		id: string
		name: string
		main_image: string
		base_price: number
		total_views: number | null
	}

	const rows: TopProductRow[] = ((result.data ?? []) as ProductRow[]).map(p => ({
		product_id: p.id,
		total_views: p.total_views ?? 0,
		name: p.name,
		main_image: p.main_image,
		base_price: p.base_price,
	}))

	return { data: rows, error: null }
}
