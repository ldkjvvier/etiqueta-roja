import { unstable_cache } from 'next/cache'
import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/store-context'
import { getPublicStoreContext } from '@/lib/data/admin-context'

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
	}
}

function getPublicProductsBaseQuery(db: any, storeId: string) {
	return db
		.from('products')
		.select(
			`id,slug,name,description,base_price,compare_at_price,main_image,category:categories(name),variants:product_variants(id,combination_key,stock_quantity,reserved_stock,low_stock_threshold,track_inventory,price,image_url,sku),gallery:product_images(image_url,display_order)`,
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

export async function getProducts(params?: {
	page?: number
	pageSize?: number
	q?: string
	countMode?: 'exact' | 'planned'
}): Promise<ProductListResult> {
	const page = Math.max(1, params?.page ?? 1)
	const pageSize = params?.pageSize ?? 8
	const q = params?.q ?? ''
	const countMode = params?.countMode ?? 'exact'

	const fetcher = unstable_cache(
		async () => {
			const db = createPublicClient() as any
			const { storeId } = await getPublicStoreContext()
			const from = (page - 1) * pageSize
			const to = from + pageSize - 1

			let query = db
				.from('products')
				.select(PRODUCT_LISTING_SELECT, { count: countMode })
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
		['products-listing', String(page), String(pageSize), q, countMode],
		{ tags: ['products'], revalidate: 60 },
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
