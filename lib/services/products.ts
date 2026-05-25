import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/data/admin-context'

export type AdminProductRow = {
	id: string
	name: string
	slug: string
	base_price: number
	compare_at_price: number | null
	main_image: string
	status: 'draft' | 'active' | 'archived'
	category_id: string | null
	drop_id: string | null
	deleted_at: string | null
	created_at: string
	updated_at: string
	category: { name: string } | null
	drop: { name: string; status: string } | null
	variants: Array<{
		id: string
		stock_quantity: number
		reserved_stock: number
		low_stock_threshold: number
		track_inventory: boolean | null
		is_active: boolean
		deleted_at: string | null
	}>
}

export type AdminProductListItem = {
	id: string
	name: string
	slug: string
	base_price: number
	compare_at_price: number | null
	main_image: string
	status: 'draft' | 'active' | 'archived'
	category_name: string | null
	drop_name: string | null
	available_stock: number
	reserved_stock: number
	variants_count: number
	low_stock_alert: boolean
}

export interface GetAdminProductsParams {
	page?: number
	limit?: number
	query?: string
	status?: 'draft' | 'active' | 'archived' | 'all'
}

export async function getAdminProductsPage({
	page = 1,
	limit = 20,
	query = '',
	status = 'all',
}: GetAdminProductsParams) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()
	const from = (page - 1) * limit
	const to = from + limit - 1

	let request = db
		.from('products')
		.select(
			`id,name,slug,base_price,compare_at_price,main_image,status,category_id,drop_id,deleted_at,created_at,updated_at,category:categories(name),drop:drops(name,status),variants:product_variants(id,stock_quantity,reserved_stock,low_stock_threshold,track_inventory,is_active,deleted_at)`,
			{ count: 'exact' },
		)
		.eq('store_id', store.storeId)
		.is('deleted_at', null)

	if (query) {
		request = request.or(
			`name.ilike.%${query}%,slug.ilike.%${query}%`,
		)
	}

	if (status !== 'all') {
		request = request.eq('status', status)
	}

	const { data, error, count } = await request
		.order('created_at', { ascending: false })
		.range(from, to)

	if (error) {
		console.error('Error loading admin products:', error)
		return {
			products: [] as AdminProductListItem[],
			totalCount: 0,
			totalPages: 0,
		}
	}

	const products = (data as unknown as AdminProductRow[]).map(
		(row) => {
			const activeVariants = row.variants.filter(
				(variant) => variant.is_active && !variant.deleted_at,
			)
			const reservedStock = activeVariants.reduce(
				(acc, variant) => acc + (variant.reserved_stock || 0),
				0,
			)
			const availableStock = activeVariants.reduce(
				(acc, variant) =>
					acc +
					(variant.track_inventory === false
						? 0
						: Math.max(
								(variant.stock_quantity || 0) -
									(variant.reserved_stock || 0),
								0,
							)),
				0,
			)
			const lowStockAlert = activeVariants.some(
				(variant) =>
					variant.track_inventory !== false &&
					Math.max(
						(variant.stock_quantity || 0) -
							(variant.reserved_stock || 0),
						0,
					) <= (variant.low_stock_threshold || 0),
			)

			return {
				id: row.id,
				name: row.name,
				slug: row.slug,
				base_price: row.base_price,
				compare_at_price: row.compare_at_price,
				main_image: row.main_image,
				status: row.status,
				category_name: row.category?.name ?? null,
				drop_name: row.drop?.name ?? null,
				available_stock: availableStock,
				reserved_stock: reservedStock,
				variants_count: activeVariants.length,
				low_stock_alert: lowStockAlert,
			}
		},
	)

	return {
		products,
		totalCount: count ?? 0,
		totalPages: Math.ceil((count ?? 0) / limit),
	}
}

export async function getAdminProductById(id: string) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const { data: product, error: productError } = await db
		.from('products')
		.select(
			'id,store_id,name,slug,description,base_price,compare_at_price,main_image,category_id,drop_id,status,is_customizable,created_at,updated_at',
		)
		.eq('id', id)
		.eq('store_id', store.storeId)
		.is('deleted_at', null)
		.maybeSingle()

	if (productError || !product) {
		return null
	}

	const [{ data: galleryImages }, { data: variants }] =
		await Promise.all([
			db
				.from('product_images')
				.select('image_url,display_order')
				.eq('product_id', id)
				.order('display_order', { ascending: true }),
			db
				.from('product_variants')
				.select(
					'id,sku,combination_key,price,weight,image_url,track_inventory,stock_quantity,reserved_stock,low_stock_threshold,is_active,deleted_at',
				)
				.eq('product_id', id)
				.order('combination_key', { ascending: true }),
		])

	const variantIds = (variants ?? []).map(
		(variant: any) => variant.id,
	)
	const { data: optionLinks } = variantIds.length
		? await db
				.from('variant_option_values')
				.select(
					'variant_id, option_value:product_option_values(value, option:product_options(name))',
				)
				.in('variant_id', variantIds)
		: { data: [] as any[] }

	const optionValueByVariant = new Map<
		string,
		{ name: string; value: string }
	>()
	for (const link of optionLinks ?? []) {
		const variantId = link.variant_id
		const optionName = (link.option_value as any)?.option?.name
		const optionValue = (link.option_value as any)?.value
		if (variantId && optionName && optionValue) {
			optionValueByVariant.set(variantId, {
				name: optionName,
				value: optionValue,
			})
		}
	}

	const mappedVariants = (variants ?? [])
		.filter((variant: any) => !variant.deleted_at)
		.map((variant: any) => {
			const option = optionValueByVariant.get(variant.id)
			return {
				id: variant.id,
				size: option?.value ?? variant.combination_key,
				// Cambiado: exponer columnas de variantes para edición en UI.
				price: variant.price,
				stock_quantity: variant.stock_quantity,
				reserved_stock: variant.reserved_stock,
				low_stock_threshold: variant.low_stock_threshold,
				sku: variant.sku,
				weight: variant.weight,
				image_url: variant.image_url,
				track_inventory: variant.track_inventory,
			}
		})

	return {
		...product,
		images: [
			product.main_image,
			...(galleryImages ?? []).map((image: any) => image.image_url),
		],
		variants: mappedVariants,
	}
}

export async function getCategoryOptions() {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const { data, error } = await db
		.from('categories')
		.select('id,name,slug')
		.eq('store_id', store.storeId)
		.order('name', { ascending: true })

	if (error) {
		console.error('Error loading category options:', error)
		return [] as Array<{ id: string; name: string; slug: string }>
	}

	return data
}

export async function getDropOptions() {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const { data, error } = await db
		.from('drops')
		.select('id,name,status,start_time,end_time')
		.eq('store_id', store.storeId)
		.order('start_time', { ascending: false })
		.limit(100)

	if (error) {
		console.error('Error loading drop options:', error)
		return [] as Array<{
			id: string
			name: string
			status: string
			start_time: string
			end_time: string | null
		}>
	}

	return data
}
