'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/data/admin-context'

type ActionResult<T = void> = {
	success: boolean
	data?: T
	error?: string
}

export async function upsertConfig(
	key: string,
	value: Record<string, unknown>,
	visibility: 'public' | 'private' | 'internal' = 'public',
): Promise<ActionResult> {
	const { storeId, userId } = await getAdminStoreContext()
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { error } = await db.from('site_config').upsert(
		{
			store_id: storeId,
			key,
			value,
			visibility,
			updated_by: userId,
			is_active: true,
		},
		{ onConflict: 'store_id,key' },
	)

	if (error) {
		console.error('[upsertConfig]', error)
		return { success: false, error: 'Error al guardar configuración' }
	}

	revalidateTag('site-config', 'max')
	revalidatePath('/admin/config', 'page')
	revalidatePath('/', 'layout')
	return { success: true }
}

export async function toggleConfigActive(
	id: string,
	is_active: boolean,
): Promise<ActionResult> {
	const { storeId } = await getAdminStoreContext()
	const supabase = await createClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any

	const { error } = await db
		.from('site_config')
		.update({ is_active })
		.eq('id', id)
		.eq('store_id', storeId)

	if (error) {
		console.error('[toggleConfigActive]', error)
		return {
			success: false,
			error: 'Error al actualizar configuración',
		}
	}

	revalidateTag('site-config', 'max')
	revalidatePath('/admin/config', 'page')
	return { success: true }
}
