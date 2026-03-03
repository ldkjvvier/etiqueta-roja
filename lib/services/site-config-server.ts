import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export interface PromoBannerConfig {
	message: string
	link?: string | null
}

export interface ContactInfoConfig {
	whatsapp: string
	instagram: string
	tiktok: string
	email: string
}

function isDynamicServerUsageError(error: unknown) {
	if (!error || typeof error !== 'object') return false
	const digest = (error as { digest?: string }).digest
	const description = String(
		(error as { description?: string }).description || '',
	)
	return (
		digest === 'DYNAMIC_SERVER_USAGE' ||
		description.includes('Dynamic server usage')
	)
}

export async function getSiteConfig<T>(
	key: string,
): Promise<{ value: T; is_active: boolean } | null> {
	try {
		const supabase = await createClient()
		const store = await getAdminStoreContext()
		const { data, error } = await supabase
			.from('site_config')
			.select('value, is_active')
			.eq('store_id', store.id)
			.eq('key', key)
			.maybeSingle()

		if (error) {
			console.warn(
				`Failed to fetch site config for key: ${key}`,
				error,
			)
			return null
		}

		if (!data) {
			return null
		}

		// Supabase stores JSONB as any, we cast it to T
		return {
			value: (data as any).value as unknown as T,
			is_active: (data as any).is_active ?? true,
		}
	} catch (e) {
		if (!isDynamicServerUsageError(e)) {
			console.error(
				`Exception fetching site config for key: ${key}`,
				e,
			)
		}
		return null
	}
}
