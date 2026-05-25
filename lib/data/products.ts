import { createClient } from '@/lib/supabase/server'
import type {
	DataResult,
	PaginatedResult,
	Product,
	ProductWithDetails,
	InsertProduct,
	UpdateProduct,
} from '@/types/database.types'

const PRODUCT_LIST_SELECT = `
	id, name, slug, description, base_price, compare_at_price,
	main_image, status, is_customizable, total_views, created_at, updated_at,
	store_id, category_id, drop_id, deleted_at,
	categories ( id, name, slug )
`

const PRODUCT_DETAIL_SELECT = `
	id, name, slug, description, base_price, compare_at_price,
	main_image, status, is_customizable, total_views, created_at, updated_at,
	store_id, category_id, drop_id, deleted_at,
	categories ( id, name, slug ),
	product_images ( id, image_url, display_order ),
	product_options (
		id, name, position,
		product_option_values ( id, value, position )
	),
	product_variants (
		id, sku, combination_key, price, stock_quantity,
		reserved_stock, is_active, image_url, track_inventory, weight, deleted_at,
		variant_option_values ( option_value_id )
	)
`

export type ProductFilters = {
	categoryId?: string
	dropId?: string
	query?: string
	page?: number
	pageSize?: number
}

export type AdminProductFilters = {
	status?: string
	query?: string
	categoryId?: string
	page?: number
	pageSize?: number
	includeDeleted?: boolean
}

function mapPostgresError(code: string | undefined, table: string): string {
	switch (code) {
		case '23505':
			return table === 'products'
				? 'Ya existe un producto con ese slug'
				: 'Registro duplicado'
		case '23503':
			return 'Referencia inválida: categoría o drop no existe'
		case '23514':
			return 'El precio de comparación debe ser mayor al precio base'
		default:
			return 'Error de base de datos'
	}
}

export async function getPublicProducts(
	storeSlug: string,
	filters: ProductFilters = {},
): Promise<PaginatedResult<ProductWithDetails>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const page = filters.page ?? 1
	const pageSize = filters.pageSize ?? 20
	const from = (page - 1) * pageSize
	const to = from + pageSize - 1

	const { data: store } = await db
		.from('stores')
		.select('id')
		.eq('slug', storeSlug)
		.eq('is_active', true)
		.single()

	if (!store) {
		return {
			data: [],
			count: 0,
			page,
			pageSize,
			totalPages: 0,
			error: 'Tienda no encontrada',
		}
	}

	let query = db
		.from('products')
		.select(PRODUCT_DETAIL_SELECT, { count: 'exact' })
		.eq('store_id', (store as { id: string }).id)
		.eq('status', 'active')
		.is('deleted_at', null)
		.range(from, to)
		.order('created_at', { ascending: false })

	if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
	if (filters.dropId) query = query.eq('drop_id', filters.dropId)
	if (filters.query) query = query.ilike('name', `%${filters.query}%`)

	const { data, error, count } = await query

	if (error) {
		console.error('[getPublicProducts]', error)
		return {
			data: [],
			count: 0,
			page,
			pageSize,
			totalPages: 0,
			error: 'Error al cargar productos',
		}
	}

	const totalPages = Math.ceil((count ?? 0) / pageSize)
	return {
		data: (data as ProductWithDetails[]) ?? [],
		count: count ?? 0,
		page,
		pageSize,
		totalPages,
		error: null,
	}
}

export async function getProductBySlug(
	storeSlug: string,
	productSlug: string,
): Promise<DataResult<ProductWithDetails>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data: store } = await db
		.from('stores')
		.select('id')
		.eq('slug', storeSlug)
		.eq('is_active', true)
		.single()

	if (!store) {
		return { data: null, error: 'Tienda no encontrada' }
	}

	const { data, error } = await db
		.from('products')
		.select(PRODUCT_DETAIL_SELECT)
		.eq('store_id', (store as { id: string }).id)
		.eq('slug', productSlug)
		.eq('status', 'active')
		.is('deleted_at', null)
		.single()

	if (error) {
		console.error('[getProductBySlug]', error)
		return { data: null, error: 'Producto no encontrado' }
	}

	return { data: data as ProductWithDetails, error: null }
}

export async function getAdminProducts(
	storeId: string,
	filters: AdminProductFilters = {},
): Promise<PaginatedResult<Product>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const page = filters.page ?? 1
	const pageSize = filters.pageSize ?? 20
	const from = (page - 1) * pageSize
	const to = from + pageSize - 1

	let query = db
		.from('products')
		.select(PRODUCT_LIST_SELECT, { count: 'exact' })
		.eq('store_id', storeId)
		.range(from, to)
		.order('created_at', { ascending: false })

	if (!filters.includeDeleted) query = query.is('deleted_at', null)
	if (filters.status && filters.status !== 'all')
		query = query.eq('status', filters.status)
	if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
	if (filters.query) query = query.ilike('name', `%${filters.query}%`)

	const { data, error, count } = await query

	if (error) {
		console.error('[getAdminProducts]', error)
		return {
			data: [],
			count: 0,
			page,
			pageSize,
			totalPages: 0,
			error: 'Error al cargar productos',
		}
	}

	const totalPages = Math.ceil((count ?? 0) / pageSize)
	return {
		data: (data as Product[]) ?? [],
		count: count ?? 0,
		page,
		pageSize,
		totalPages,
		error: null,
	}
}

export async function createProduct(
	storeId: string,
	data: Omit<InsertProduct, 'store_id'>,
): Promise<DataResult<Product>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data: product, error } = await db
		.from('products')
		.insert({ ...data, store_id: storeId })
		.select(
			'id, name, slug, base_price, compare_at_price, main_image, status, is_customizable, total_views, created_at, updated_at, category_id, drop_id, store_id, deleted_at, description',
		)
		.single()

	if (error) {
		console.error('[createProduct]', error)
		return { data: null, error: mapPostgresError(error.code, 'products') }
	}

	return { data: product as Product, error: null }
}

export async function updateProduct(
	productId: string,
	data: UpdateProduct,
): Promise<DataResult<Product>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data: product, error } = await db
		.from('products')
		.update(data)
		.eq('id', productId)
		.is('deleted_at', null)
		.select(
			'id, name, slug, base_price, compare_at_price, main_image, status, is_customizable, total_views, created_at, updated_at, category_id, drop_id, store_id, deleted_at, description',
		)
		.single()

	if (error) {
		console.error('[updateProduct]', error)
		return { data: null, error: mapPostgresError(error.code, 'products') }
	}

	return { data: product as Product, error: null }
}

export async function softDeleteProduct(
	productId: string,
): Promise<DataResult<null>> {
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { error } = await db
		.from('products')
		.update({ deleted_at: new Date().toISOString() })
		.eq('id', productId)

	if (error) {
		console.error('[softDeleteProduct]', error)
		return { data: null, error: 'Error al eliminar producto' }
	}

	return { data: null, error: null }
}
