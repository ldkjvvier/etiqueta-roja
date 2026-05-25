'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAdminStoreContext } from '@/lib/services/admin-context'
import {
	createProduct,
	updateProduct,
	softDeleteProduct,
} from '@/lib/data/products'
import type { ProductStatus } from '@/types/database.types'

type ActionResult<T = undefined> = {
	success: boolean
	data?: T
	error?: string
}

const productSchema = z.object({
	name: z.string().min(1).max(255),
	slug: z
		.string()
		.min(1)
		.max(255)
		.regex(
			/^[a-z0-9-]+$/,
			'El slug solo puede tener letras minúsculas, números y guiones',
		),
	description: z.string().nullable().optional(),
	base_price: z.number().positive('El precio debe ser mayor a 0'),
	compare_at_price: z.number().positive().nullable().optional(),
	main_image: z.string().min(1, 'La imagen principal es requerida'),
	status: z.enum(['draft', 'active', 'archived']).default('draft'),
	is_customizable: z.boolean().default(false),
	category_id: z.string().uuid().nullable().optional(),
	drop_id: z.string().uuid().nullable().optional(),
})

type ProductPayload = z.infer<typeof productSchema>

async function getStore() {
	try {
		return await getAdminStoreContext()
	} catch {
		return null
	}
}

export async function create(
	payload: ProductPayload,
): Promise<ActionResult<{ id: string }>> {
	const parsed = productSchema.safeParse(payload)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
		}
	}

	const store = await getStore()
	if (!store)
		return { success: false, error: 'Sin acceso de administrador' }

	const { data, error } = await createProduct(store.id, parsed.data)

	if (error || !data) {
		return {
			success: false,
			error: error ?? 'Error al crear producto',
		}
	}

	revalidatePath('/admin/products')
	revalidatePath('/')

	return { success: true, data: { id: data.id } }
}

export async function update(
	productId: string,
	payload: Partial<ProductPayload>,
): Promise<ActionResult> {
	if (!productId)
		return { success: false, error: 'ID de producto requerido' }

	const parsed = productSchema.partial().safeParse(payload)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
		}
	}

	const store = await getStore()
	if (!store)
		return { success: false, error: 'Sin acceso de administrador' }

	const { error } = await updateProduct(productId, parsed.data)
	if (error) return { success: false, error }

	revalidatePath('/admin/products')
	revalidatePath(`/admin/products/${productId}`)
	revalidatePath('/')

	return { success: true }
}

export async function softDelete(
	productId: string,
): Promise<ActionResult> {
	if (!productId)
		return { success: false, error: 'ID de producto requerido' }

	const store = await getStore()
	if (!store)
		return { success: false, error: 'Sin acceso de administrador' }

	const { error } = await softDeleteProduct(productId)
	if (error) return { success: false, error }

	revalidatePath('/admin/products')
	revalidatePath('/')

	return { success: true }
}

export async function updateStatus(
	productId: string,
	status: ProductStatus,
): Promise<ActionResult> {
	if (!productId)
		return { success: false, error: 'ID de producto requerido' }

	const validStatuses: ProductStatus[] = [
		'draft',
		'active',
		'archived',
	]
	if (!validStatuses.includes(status)) {
		return { success: false, error: 'Estado inválido' }
	}

	const store = await getStore()
	if (!store)
		return { success: false, error: 'Sin acceso de administrador' }

	const { error } = await updateProduct(productId, { status })
	if (error) return { success: false, error }

	revalidatePath('/admin/products')
	revalidatePath('/')

	return { success: true }
}
