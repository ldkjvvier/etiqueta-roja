'use server'

import {
	getProducts,
	type ProductListResult,
} from '@/lib/services/products-server'

export async function searchProductsAction(
	q: string,
): Promise<ProductListResult> {
	return getProducts({ q: q.trim(), pageSize: 24 })
}
