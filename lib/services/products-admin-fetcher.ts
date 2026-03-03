'use server'

import {
	getAdminProductById,
	getCategoryOptions,
	getDropOptions,
} from '@/lib/services/products'

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
