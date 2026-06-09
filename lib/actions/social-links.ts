'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/data/admin-context'
import { SOCIAL_PLATFORMS, type SocialPlatform } from '@/lib/data/social-links'
import type { TablesInsert } from '@/lib/supabase/types'
import { z } from 'zod'

const optionalUrlSchema = z
	.string()
	.trim()
	.refine(
		(value) => {
			if (!value) return true
			try {
				const parsed = new URL(value)
				return parsed.protocol === 'https:' || parsed.protocol === 'http:'
			} catch {
				return false
			}
		},
		{ message: 'URL inválida' },
	)

const optionalEmailSchema = z
	.string()
	.trim()
	.refine((value) => !value || z.string().email().safeParse(value).success, {
		message: 'Email inválido',
	})

const optionalPhoneSchema = z
	.string()
	.trim()
	.refine((value) => !value || /^\+?[0-9\s-]{6,20}$/.test(value), {
		message: 'Teléfono inválido',
	})

const socialLinksSchema = z.object({
	instagram: optionalUrlSchema,
	twitter: optionalUrlSchema,
	facebook: optionalUrlSchema,
	tiktok: optionalUrlSchema,
	whatsapp: optionalPhoneSchema,
	email: optionalEmailSchema,
})

export async function updateStoreSocialLinks(
	_prevState: unknown,
	formData: FormData,
) {
	const parsed = socialLinksSchema.safeParse({
		instagram: String(formData.get('instagram') || ''),
		twitter: String(formData.get('twitter') || ''),
		facebook: String(formData.get('facebook') || ''),
		tiktok: String(formData.get('tiktok') || ''),
		whatsapp: String(formData.get('whatsapp') || ''),
		email: String(formData.get('email') || ''),
	})

	if (!parsed.success) {
		return {
			message: 'Revisa los datos de redes sociales y contacto',
			error: true,
		}
	}

	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	const rows: TablesInsert<'store_social_links'>[] = []
	const platformsToDelete: SocialPlatform[] = []

	SOCIAL_PLATFORMS.forEach((platform, index) => {
		const value = parsed.data[platform].trim()
		if (value) {
			rows.push({
				store_id: storeId,
				platform,
				value,
				is_active: true,
				sort_order: index,
			})
		} else {
			platformsToDelete.push(platform)
		}
	})

	if (rows.length > 0) {
		const { error } = await supabase
			.from('store_social_links')
			.upsert(rows, { onConflict: 'store_id,platform' })
		if (error) {
			console.error('[updateStoreSocialLinks] upsert', error)
			return { message: 'No se pudo guardar la configuración', error: true }
		}
	}

	if (platformsToDelete.length > 0) {
		const { error } = await supabase
			.from('store_social_links')
			.delete()
			.eq('store_id', storeId)
			.in('platform', platformsToDelete)
		if (error) {
			console.error('[updateStoreSocialLinks] delete', error)
			return { message: 'No se pudo guardar la configuración', error: true }
		}
	}

	revalidatePath('/admin/config')
	revalidatePath('/', 'layout')
	return { message: 'Configuración guardada correctamente', error: false }
}
