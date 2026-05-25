'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/data/admin-context'

const dropSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
	description: z.string().optional(),
	cover_image: z.string().url().optional().or(z.literal('')),
	start_time: z.string().datetime(),
	end_time: z.string().datetime().optional().or(z.literal('')),
	status: z.enum(['scheduled', 'live', 'ended']).default('scheduled'),
})

type ActionResult<T = void> = { success: boolean; data?: T; error?: string }

export async function createDrop(
	formData: FormData,
): Promise<ActionResult<{ id: string }>> {
	const { storeId } = await getAdminStoreContext()
	const parsed = dropSchema.safeParse(Object.fromEntries(formData))
	if (!parsed.success)
		return { success: false, error: parsed.error.errors[0].message }

	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('drops')
		.insert({
			...parsed.data,
			store_id: storeId,
			end_time: parsed.data.end_time || null,
		})
		.select('id')
		.single()

	if (error) {
		if (error.code === '23505')
			return { success: false, error: 'Ya existe un drop con ese slug' }
		console.error('[createDrop]', error)
		return { success: false, error: 'Error al crear drop' }
	}

	revalidatePath('/admin/drops')
	return { success: true, data: { id: data.id } }
}

export async function updateDrop(
	id: string,
	formData: FormData,
): Promise<ActionResult> {
	const { storeId } = await getAdminStoreContext()
	const parsed = dropSchema.safeParse(Object.fromEntries(formData))
	if (!parsed.success)
		return { success: false, error: parsed.error.errors[0].message }

	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { error } = await db
		.from('drops')
		.update({ ...parsed.data, end_time: parsed.data.end_time || null })
		.eq('id', id)
		.eq('store_id', storeId)

	if (error) {
		console.error('[updateDrop]', error)
		return { success: false, error: 'Error al actualizar drop' }
	}

	revalidatePath('/admin/drops')
	return { success: true }
}

export async function deleteDrop(id: string): Promise<ActionResult> {
	const { storeId } = await getAdminStoreContext()
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { error } = await db
		.from('drops')
		.delete()
		.eq('id', id)
		.eq('store_id', storeId)

	if (error) {
		if (error.code === '23503')
			return {
				success: false,
				error: 'No se puede eliminar: tiene productos asociados',
			}
		console.error('[deleteDrop]', error)
		return { success: false, error: 'Error al eliminar drop' }
	}

	revalidatePath('/admin/drops')
	return { success: true }
}

export async function advanceDropStatus(id: string): Promise<ActionResult> {
	const { storeId } = await getAdminStoreContext()
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { data: drop, error: fetchError } = await db
		.from('drops')
		.select('status')
		.eq('id', id)
		.eq('store_id', storeId)
		.single()

	if (fetchError || !drop) return { success: false, error: 'Drop no encontrado' }

	const next: Record<string, string> = { scheduled: 'live', live: 'ended' }
	const nextStatus = next[drop.status]
	if (!nextStatus)
		return { success: false, error: 'El drop ya está en estado final' }

	const { error } = await db
		.from('drops')
		.update({ status: nextStatus })
		.eq('id', id)
		.eq('store_id', storeId)

	if (error) {
		console.error('[advanceDropStatus]', error)
		return { success: false, error: 'Error al avanzar estado' }
	}

	revalidatePath('/admin/drops')
	return { success: true }
}
