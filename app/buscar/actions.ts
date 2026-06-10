'use server'

import {
	searchProducts,
	SEARCH_PAGE_SIZE,
	type ProductListResult,
} from '@/lib/services/products-server'
import type { SearchFilters } from '@/lib/search/filters'

// Paginación incremental ("Cargar más"). El estado de filtros lo construye y
// valida el cliente desde la URL; aquí solo se pagina sobre esos filtros.
export async function loadMoreSearchAction(
	filters: SearchFilters,
	page: number,
): Promise<ProductListResult> {
	return searchProducts(filters, page, SEARCH_PAGE_SIZE)
}
