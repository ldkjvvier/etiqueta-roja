'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/data/admin-context'
import type { SiteConfigVisibility } from '@/types/database.types'

type ActionResult<T = undefined> = {
	success: boolean
	data?: T
	error?: string
}

const CONFIG_KEY_WHITELIST = [
	'home_hero_banner',
	'promo_banner',
	'announcement_bar',
	'social_links',
	'contact_info',
	'store_settings',
] as const

type ConfigKey = (typeof CONFIG_KEY_WHITELIST)[number]

function isValidConfigKey(key: string): key is ConfigKey {
	return (CONFIG_KEY_WHITELIST as readonly string[]).includes(key)
}

export async function updateConfig(
	key: string,
	value: unknown,
	visibility: SiteConfigVisibility = 'private',
): Promise<ActionResult> {
	if (!isValidConfigKey(key)) {
		return {
			success: false,
			error: 'Clave de configuración no permitida',
		}
	}

	let store
	try {
		store = await getAdminStoreContext()
	} catch (e: unknown) {
		if (e && typeof e === 'object' && 'digest' in e) throw e
		return { success: false, error: 'Sin acceso de administrador' }
	}

	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { error } = await db.from('site_config').upsert(
		{
			store_id: store.storeId,
			key,
			value: value as import('@/lib/supabase/types').Json,
			visibility,
			is_active: true,
			updated_by: user?.id ?? null,
		},
		{ onConflict: 'store_id,key' },
	)

	if (error) {
		console.error('[updateConfig]', error)
		return { success: false, error: 'Error al guardar configuración' }
	}

	revalidatePath('/admin/config')
	revalidatePath('/')

	return { success: true }
}

const storeInfoSchema = z.object({
	name: z.string().min(1).max(255),
})

export async function updateStoreInfo(
	payload: z.infer<typeof storeInfoSchema>,
): Promise<ActionResult> {
	const parsed = storeInfoSchema.safeParse(payload)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
		}
	}

	let store
	try {
		store = await getAdminStoreContext()
	} catch (e: unknown) {
		if (e && typeof e === 'object' && 'digest' in e) throw e
		return { success: false, error: 'Sin acceso de administrador' }
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = (await createClient()) as any

	const { error } = await db
		.from('stores')
		.update({ name: parsed.data.name })
		.eq('id', store.storeId)

	if (error) {
		console.error('[updateStoreInfo]', error)
		return {
			success: false,
			error: 'Error al actualizar información de la tienda',
		}
	}

	revalidatePath('/admin/config')
	revalidatePath('/')

	return { success: true }
}
