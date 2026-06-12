'use server'

import {
	getAdminProductsPage,
	getAdminProductById,
	getCategoryOptions,
	getDropOptions,
	type AdminProductListItem,
} from '@/lib/services/products'

export type AdminProduct = {
	id: string
	name: string
	slug: string
	base_price: number
	compare_at_price: number | null
	main_image: string
	status: 'draft' | 'active' | 'archived'
	category_name: string | null
	drop_name: string | null
	reserved_stock: number
	variants_count: number
	available_stock: number
	low_stock_alert: boolean
}

interface GetAdminProductsParams {
	page?: number
	limit?: number
	query?: string
}

export async function getAdminProducts({
	page = 1,
	limit = 10,
	query = '',
}: GetAdminProductsParams) {
	const { products, totalCount, totalPages } =
		await getAdminProductsPage({
			page,
			limit,
			query,
		})

	return {
		products: products as AdminProductListItem[],
		totalCount,
		totalPages,
	}
}

export interface Category {
	id: string
	name: string
}

export interface DropOption {
	id: string
	name: string
	status: string
	start_time: string
	end_time: string | null
}

export async function getCategories() {
	const data = await getCategoryOptions()
	return (data as Category[]) || []
}

export async function getDrops() {
	const data = await getDropOptions()
	return (data as DropOption[]) || []
}

export async function getProductById(id: string) {
	return getAdminProductById(id)
}
