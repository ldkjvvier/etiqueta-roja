'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/data/admin-context'

const categorySchema = z.object({
	name: z.string().min(1, 'Nombre requerido').max(100),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9-]+$/, 'Slug inválido'),
	description: z.string().optional(),
	image_url: z.string().url().optional().or(z.literal('')),
})

type ActionResult<T = void> = { success: boolean; data?: T; error?: string }

export async function createCategory(
	formData: FormData,
): Promise<ActionResult<{ id: string }>> {
	const { storeId } = await getAdminStoreContext()
	const parsed = categorySchema.safeParse(Object.fromEntries(formData))
	if (!parsed.success)
		return { success: false, error: parsed.error.errors[0].message }

	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('categories')
		.insert({ ...parsed.data, store_id: storeId })
		.select('id')
		.single()

	if (error) {
		if (error.code === '23505')
			return { success: false, error: 'Ya existe una categoría con ese slug' }
		console.error('[createCategory]', error)
		return { success: false, error: 'Error al crear categoría' }
	}

	revalidatePath('/admin/categories')
	revalidatePath('/')
	return { success: true, data: { id: data.id } }
}

export async function updateCategory(
	id: string,
	formData: FormData,
): Promise<ActionResult> {
	const { storeId } = await getAdminStoreContext()
	const parsed = categorySchema.safeParse(Object.fromEntries(formData))
	if (!parsed.success)
		return { success: false, error: parsed.error.errors[0].message }

	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { error } = await db
		.from('categories')
		.update(parsed.data)
		.eq('id', id)
		.eq('store_id', storeId)

	if (error) {
		if (error.code === '23505')
			return { success: false, error: 'Ya existe una categoría con ese slug' }
		console.error('[updateCategory]', error)
		return { success: false, error: 'Error al actualizar categoría' }
	}

	revalidatePath('/admin/categories')
	revalidatePath('/')
	return { success: true }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
	const { storeId } = await getAdminStoreContext()
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { error } = await db
		.from('categories')
		.delete()
		.eq('id', id)
		.eq('store_id', storeId)

	if (error) {
		if (error.code === '23503')
			return {
				success: false,
				error: 'No se puede eliminar: tiene productos asociados',
			}
		console.error('[deleteCategory]', error)
		return { success: false, error: 'Error al eliminar categoría' }
	}

	revalidatePath('/admin/categories')
	revalidatePath('/')
	return { success: true }
}
