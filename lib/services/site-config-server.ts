import { createClient } from '@/lib/supabase/server'

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

export async function getSiteConfig<T>(
	key: string
): Promise<{ value: T; is_active: boolean } | null> {
	try {
		const supabase = await createClient()
		const { data, error } = await supabase
			.from('site_config')
			.select('value, is_active')
			.eq('key', key)
			.single()

		if (error || !data) {
			// In development or if table is empty, we might want to fail silently or return defaults
			// But since we provided a seed migration, it should exist.
			console.warn(
				`Failed to fetch site config for key: ${key}`,
				error
			)
			return null
		}

		// Supabase stores JSONB as any, we cast it to T
		return {
			value: (data as any).value as unknown as T,
			is_active: (data as any).is_active ?? true,
		}
	} catch (e) {
		console.error(`Exception fetching site config for key: ${key}`, e)
		return null
	}
}
