import { createClient } from '@/lib/supabase/server'
import {
	getPublicStoreContext,
	getAdminStoreContext,
} from '@/lib/data/admin-context'

export const SOCIAL_PLATFORMS = [
	'instagram',
	'twitter',
	'facebook',
	'whatsapp',
	'tiktok',
	'email',
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

export type StoreSocialLinks = Partial<Record<SocialPlatform, string>>

export type AdminSocialLink = {
	platform: SocialPlatform
	value: string
	is_active: boolean
}

function isSocialPlatform(value: string): value is SocialPlatform {
	return (SOCIAL_PLATFORMS as readonly string[]).includes(value)
}

/**
 * Storefront read: returns active social links as a { platform: value } map.
 * RLS expone solo filas con is_active = true para anon.
 */
export async function getStoreSocialLinks(): Promise<StoreSocialLinks> {
	const supabase = await createClient()
	const { storeId } = await getPublicStoreContext()

	const { data, error } = await supabase
		.from('store_social_links')
		.select('platform, value')
		.eq('store_id', storeId)
		.eq('is_active', true)

	if (error) {
		console.error('[getStoreSocialLinks]', error)
		return {}
	}

	const result: StoreSocialLinks = {}
	for (const row of data ?? []) {
		if (isSocialPlatform(row.platform) && row.value) {
			result[row.platform] = row.value
		}
	}
	return result
}

/**
 * Admin read: returns every link (incl. inactive) to prefill the config form.
 */
export async function getAdminSocialLinks(): Promise<AdminSocialLink[]> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()

	const { data, error } = await supabase
		.from('store_social_links')
		.select('platform, value, is_active')
		.eq('store_id', storeId)
		.order('sort_order')

	if (error) {
		console.error('[getAdminSocialLinks]', error)
		return []
	}

	const result: AdminSocialLink[] = []
	for (const row of data ?? []) {
		if (isSocialPlatform(row.platform)) {
			result.push({
				platform: row.platform,
				value: row.value,
				is_active: row.is_active,
			})
		}
	}
	return result
}
