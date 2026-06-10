import { unstable_cache } from 'next/cache'
import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { Product, ProductDrop } from '@/lib/store-context'
import { getPublicStoreContext } from '@/lib/data/admin-context'
import {
	type SearchFilters,
	type SearchSort,
	sizeLabelToKeyValue,
	sortSizes,
} from '@/lib/search/filters'

type VariantRow = {
	id: string
	combination_key: string
	stock_quantity: number
	reserved_stock: number
	low_stock_threshold: number
	track_inventory: boolean | null
	price?: number | null
	image_url?: string | null
	sku?: string | null
}

type ProductRow = {
	id: string
	slug: string
	name: string
	description: string | null
	base_price: number
	compare_at_price: number | null
	main_image: string
	category: { name: string | null } | null
	variants: VariantRow[]
	gallery?: Array<{ image_url: string; display_order: number }>
	// Solo presente en la query de detalle (getPublicProductsBaseQuery)
	drop?: {
		name: string
		slug: string | null
		status: ProductDrop['status']
	} | null
}

// Lean SELECT for the product listing grid — only fields needed by ProductCard.
// Detail pages use getPublicProductsBaseQuery which fetches the full payload.
const PRODUCT_LISTING_SELECT =
	'id,slug,name,base_price,compare_at_price,main_image,' +
	'category:categories(name),' +
	'variants:product_variants(id,combination_key,stock_quantity,reserved_stock,low_stock_threshold,track_inventory),' +
	'gallery:product_images(image_url,display_order)'

function parseSizeFromCombinationKey(combinationKey: string) {
	const [, rawValue] = (combinationKey || '').split(':')
	return rawValue?.replace(/-/g, ' ').toUpperCase() || 'UNICA'
}

function mapRowToProduct(row: ProductRow): Product {
	const mappedVariants = (row.variants ?? []).map((variant) => {
		const size = parseSizeFromCombinationKey(variant.combination_key)
		const trackInventory = variant.track_inventory !== false
		const availableStock = trackInventory
			? Math.max(
					(variant.stock_quantity || 0) -
						(variant.reserved_stock || 0),
					0,
				)
			: Number.MAX_SAFE_INTEGER

		return {
			id: variant.id,
			size,
			stock: availableStock,
			trackInventory,
			stockQuantity: variant.stock_quantity || 0,
			reservedStock: variant.reserved_stock || 0,
			lowStockThreshold: variant.low_stock_threshold || 0,
			combinationKey: variant.combination_key,
			price: variant.price,
			imageUrl: variant.image_url,
			sku: variant.sku,
		}
	})

	const totalAvailable = mappedVariants.reduce(
		(acc, variant) => acc + variant.stock,
		0,
	)
	const lowStock = mappedVariants.some(
		(variant) =>
			variant.trackInventory !== false &&
			variant.stock > 0 &&
			variant.stock <= variant.lowStockThreshold,
	)

	const galleryImages = (row.gallery ?? [])
		.sort((a, b) => a.display_order - b.display_order)
		.map((image) => image.image_url)

	const allImages = [row.main_image, ...galleryImages].filter(Boolean)
	const uniqueImages = Array.from(new Set(allImages))

	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		price: row.base_price,
		originalPrice: row.compare_at_price ?? undefined,
		image: row.main_image,
		images: uniqueImages,
		sizes: mappedVariants.map((variant) => variant.size),
		variants: mappedVariants,
		stockStatus:
			totalAvailable === 0
				? 'sold_out'
				: lowStock
					? 'low'
					: 'available',
		category: row.category?.name || 'Uncategorized',
		description: row.description ?? undefined,
		drop: row.drop ?? null,
	}
}

function getPublicProductsBaseQuery(db: any, storeId: string) {
	return db
		.from('products')
		.select(
			`id,slug,name,description,base_price,compare_at_price,main_image,category:categories(name),drop:drops(name,slug,status),variants:product_variants(id,combination_key,stock_quantity,reserved_stock,low_stock_threshold,track_inventory,price,image_url,sku),gallery:product_images(image_url,display_order)`,
		)
		.eq('store_id', storeId)
		.eq('status', 'active')
		.is('deleted_at', null)
}

export type ProductListResult = {
	products: Product[]
	totalCount: number
	totalPages: number
}

// Tamaño de lote del feed de la home (infinite scroll): 3 filas × 4 columnas.
export const PRODUCTS_PAGE_SIZE = 12

export async function getProducts(params?: {
	page?: number
	pageSize?: number
	q?: string
}): Promise<ProductListResult> {
	const page = Math.max(1, params?.page ?? 1)
	const pageSize = params?.pageSize ?? 8
	const q = params?.q ?? ''

	const fetcher = unstable_cache(
		async () => {
			const db = createPublicClient() as any
			const { storeId } = await getPublicStoreContext()
			const from = (page - 1) * pageSize
			const to = from + pageSize - 1

			let query = db
				.from('products')
				.select(PRODUCT_LISTING_SELECT, { count: 'exact' })
				.eq('store_id', storeId)
				.eq('status', 'active')
				.is('deleted_at', null)
				.range(from, to)
				.order('created_at', { ascending: false })

			if (q) query = query.ilike('name', `%${q}%`)

			const { data, error, count } = await query

			if (error || !data) {
				console.error('[getProducts]', error)
				return { products: [], totalCount: 0, totalPages: 0 }
			}

			const totalCount = count ?? 0
			const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
			return {
				products: (data as ProductRow[]).map(mapRowToProduct),
				totalCount,
				totalPages,
			}
		},
		['products-listing', String(page), String(pageSize), q],
		{ tags: ['products'], revalidate: 60 },
	)

	return fetcher()
}

// ─────────────────────────────────────────────────────────────────────────
// Búsqueda con filtros (/buscar)
// ─────────────────────────────────────────────────────────────────────────

export const SEARCH_PAGE_SIZE = 24

export type SearchFacets = {
	categories: Array<{ slug: string; name: string }>
	drops: Array<{ slug: string; name: string }>
	sizes: string[]
	priceRange: { min: number; max: number } | null
}

function applySort(query: any, sort: SearchSort) {
	switch (sort) {
		case 'precio-asc':
			return query.order('base_price', { ascending: true })
		case 'precio-desc':
			return query.order('base_price', { ascending: false })
		case 'az':
			return query.order('name', { ascending: true })
		case 'za':
			return query.order('name', { ascending: false })
		default:
			return query.order('created_at', { ascending: false })
	}
}

export async function searchProducts(
	filters: SearchFilters,
	page = 1,
	pageSize = SEARCH_PAGE_SIZE,
): Promise<ProductListResult> {
	const db = createPublicClient() as any
	const { storeId } = await getPublicStoreContext()

	const safePage = Math.max(1, page)
	const from = (safePage - 1) * pageSize
	const to = from + pageSize - 1

	// Talla y disponibilidad dependen de las variantes: cuando alguno está
	// activo usamos un INNER join para que solo entren productos con al menos
	// una variante que cumpla la condición (filtrado + conteo correctos).
	const needsVariantFilter =
		filters.tallas.length > 0 || filters.disponible
	const variantSelect = needsVariantFilter
		? 'variants:product_variants!inner(id,combination_key,stock_quantity,reserved_stock,low_stock_threshold,track_inventory)'
		: 'variants:product_variants(id,combination_key,stock_quantity,reserved_stock,low_stock_threshold,track_inventory)'

	// El filtro por categoría sobre un recurso embebido solo afecta a las filas
	// padre si el join es INNER (sintaxis PostgREST `!inner`).
	const categorySelect = filters.categoria
		? 'category:categories!inner(name,slug)'
		: 'category:categories(name,slug)'

	const select =
		'id,slug,name,base_price,compare_at_price,main_image,' +
		categorySelect +
		',' +
		variantSelect +
		',gallery:product_images(image_url,display_order)'

	let query = db
		.from('products')
		.select(select, { count: 'exact' })
		.eq('store_id', storeId)
		.eq('status', 'active')
		.is('deleted_at', null)

	if (filters.q) query = query.ilike('name', `%${filters.q}%`)

	if (filters.categoria)
		query = query.eq('category.slug', filters.categoria)

	if (filters.coleccion) {
		const { data: drop } = await db
			.from('drops')
			.select('id')
			.eq('store_id', storeId)
			.eq('slug', filters.coleccion)
			.maybeSingle()
		// Slug inexistente → resultado vacío explícito en vez de ignorar el filtro.
		query = query.eq('drop_id', drop?.id ?? '00000000-0000-0000-0000-000000000000')
	}

	if (filters.precioMin != null)
		query = query.gte('base_price', filters.precioMin)
	if (filters.precioMax != null)
		query = query.lte('base_price', filters.precioMax)

	if (filters.tallas.length > 0) {
		const keys = filters.tallas.map(
			(label) => `size:${sizeLabelToKeyValue(label)}`,
		)
		query = query.in('variants.combination_key', keys)
	}

	// "Solo disponibles": proxy a nivel de variante (stock > 0). reserved_stock
	// es 0 en este catálogo, por lo que el conteo coincide; el mapeo posterior
	// recalcula stockStatus con la fórmula completa como salvaguarda.
	if (filters.disponible)
		query = query.gt('variants.stock_quantity', 0)

	query = applySort(query, filters.orden)
	query = query.range(from, to)

	const { data, error, count } = await query

	if (error || !data) {
		console.error('[searchProducts]', error)
		return { products: [], totalCount: 0, totalPages: 0 }
	}

	let products = (data as ProductRow[]).map(mapRowToProduct)
	// Salvaguarda exacta para "disponibles" ante reserved_stock > 0.
	if (filters.disponible)
		products = products.filter((p) => p.stockStatus !== 'sold_out')

	const totalCount = count ?? products.length
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
	return { products, totalCount, totalPages }
}

// Facetas disponibles para construir la UI de filtros. Solo devuelve valores
// que existen realmente en el catálogo activo (no se muestran filtros vacíos).
export async function getSearchFacets(): Promise<SearchFacets> {
	const db = createPublicClient() as any
	const { storeId } = await getPublicStoreContext()

	const fetcher = unstable_cache(
		async () => {
			const [catRes, dropRes, sizeRes, priceRes] = await Promise.all([
				// Categorías que tienen al menos un producto activo.
				db
					.from('products')
					.select('category:categories(name,slug)')
					.eq('store_id', storeId)
					.eq('status', 'active')
					.is('deleted_at', null)
					.not('category_id', 'is', null),
				db
					.from('drops')
					.select('name,slug')
					.eq('store_id', storeId)
					.in('status', ['scheduled', 'live'])
					.order('start_time', { ascending: false }),
				db
					.from('product_variants')
					.select(
						'combination_key,products!inner(store_id,status,deleted_at)',
					)
					.eq('products.store_id', storeId)
					.eq('products.status', 'active')
					.is('products.deleted_at', null),
				db
					.from('products')
					.select('base_price')
					.eq('store_id', storeId)
					.eq('status', 'active')
					.is('deleted_at', null),
			])

			// Categorías únicas.
			const catMap = new Map<string, string>()
			for (const row of catRes.data ?? []) {
				const c = (row as any).category
				if (c?.slug) catMap.set(c.slug, c.name)
			}
			const categories = Array.from(catMap, ([slug, name]) => ({
				slug,
				name,
			})).sort((a, b) => a.name.localeCompare(b.name, 'es'))

			const drops = (dropRes.data ?? []).map((d: any) => ({
				slug: d.slug as string,
				name: d.name as string,
			}))

			// Tallas únicas (etiqueta visible).
			const sizeSet = new Set<string>()
			for (const row of sizeRes.data ?? []) {
				sizeSet.add(
					parseSizeFromCombinationKey(
						(row as any).combination_key,
					),
				)
			}
			const sizes = sortSizes(Array.from(sizeSet))

			// Rango de precios.
			const priceRows = priceRes.data as
				| Array<{ base_price: number }>
				| null
			let priceRange: { min: number; max: number } | null = null
			if (priceRows && priceRows.length) {
				const prices = priceRows.map((p) => p.base_price)
				priceRange = {
					min: Math.floor(Math.min(...prices)),
					max: Math.ceil(Math.max(...prices)),
				}
			}

			return { categories, drops, sizes, priceRange }
		},
		['search-facets'],
		{ tags: ['products'], revalidate: 120 },
	)

	return fetcher()
}

export async function getProduct(
	id: string,
): Promise<Product | null> {
	const supabase = await createClient()
	const db = supabase as any
	const { storeId } = await getPublicStoreContext()
	const query = getPublicProductsBaseQuery(db, storeId)
	const { data, error } = await query.eq('id', id).maybeSingle()

	if (error || !data) {
		return null
	}

	return mapRowToProduct(data as ProductRow)
}

export async function getProductBySlug(
	slug: string,
): Promise<Product | null> {
	const supabase = await createClient()
	const db = supabase as any
	const { storeId } = await getPublicStoreContext()
	const query = getPublicProductsBaseQuery(db, storeId)
	const { data, error } = await query.eq('slug', slug).maybeSingle()

	if (error || !data) {
		return null
	}

	return mapRowToProduct(data as ProductRow)
}

export async function getRelatedProducts(
	excludeId: string,
): Promise<Product[]> {
	const supabase = await createClient()
	const db = supabase as any
	const { storeId } = await getPublicStoreContext()
	const query = getPublicProductsBaseQuery(db, storeId)
	const { data, error } = await query
		.neq('id', excludeId)
		.order('created_at', { ascending: false })
		.limit(4)

	if (error || !data) {
		return []
	}

	return (data as ProductRow[]).map(mapRowToProduct)
}
