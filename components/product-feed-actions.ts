'use server'

import {
	getProducts,
	PRODUCTS_PAGE_SIZE,
	type ProductListResult,
} from '@/lib/services/products-server'

/**
 * Carga un lote adicional del feed de productos de la home.
 * Reutiliza `getProducts` (cacheado por página vía unstable_cache),
 * por lo que cada página se sirve desde cache tras la primera petición.
 */
export async function loadMoreProducts(
	page: number,
): Promise<ProductListResult> {
	const safePage = Math.max(1, Math.floor(page) || 1)
	return getProducts({ page: safePage, pageSize: PRODUCTS_PAGE_SIZE })
}
