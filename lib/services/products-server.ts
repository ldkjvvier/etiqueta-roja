import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/store-context'
import { getAdminStoreContext } from '@/lib/services/admin-context'

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

function getPublicProductsListQuery(db: any, storeId: string) {
	return db
		.from('products')
		.select(
			'id,slug,name,description,base_price,compare_at_price,main_image,category:categories(name),variants:product_variants(id,combination_key,stock_quantity,reserved_stock,low_stock_threshold,track_inventory,price)',
		)
		.eq('store_id', storeId)
		.eq('status', 'active')
		.is('deleted_at', null)
}

export async function getProducts(): Promise<Product[]> {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()
	const query = getPublicProductsListQuery(db, store.id)
	const { data, error } = await query.order('created_at', {
		ascending: false,
	})

	if (error || !data) {
		console.error('Error fetching public products:', error)
		return []
	}

	return (data as ProductRow[]).map(mapRowToProduct)
}

export async function getProduct(
	id: string,
): Promise<Product | null> {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()
	const query = getPublicProductsBaseQuery(db, store.id)
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
	const store = await getAdminStoreContext()
	const query = getPublicProductsBaseQuery(db, store.id)
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
	const store = await getAdminStoreContext()
	const query = getPublicProductsBaseQuery(db, store.id)
	const { data, error } = await query
		.neq('id', excludeId)
		.order('created_at', { ascending: false })
		.limit(4)

	if (error || !data) {
		return []
	}

	return (data as ProductRow[]).map(mapRowToProduct)
}
