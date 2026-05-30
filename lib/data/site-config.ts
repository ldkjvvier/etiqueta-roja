import { createClient } from '@/lib/supabase/server'
import {
	getPublicStoreContext,
	getAdminStoreContext,
} from '@/lib/data/admin-context'

export type SiteConfigVisibility = 'public' | 'private' | 'internal'

export type SiteConfigRecord = {
	id: string
	store_id: string
	key: string
	value: Record<string, unknown>
	is_active: boolean
	visibility: SiteConfigVisibility
	description: string | null
	updated_by: string | null
	created_at: string
	updated_at: string
}

type DataResult<T> = { data: T | null; error: string | null }

export async function getPublicConfig(
	keys?: string[],
): Promise<DataResult<Record<string, unknown>>> {
	const supabase = await createClient()
	const { storeId } = await getPublicStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	let query = db
		.from('site_config')
		.select('key, value')
		.eq('store_id', storeId)
		.eq('is_active', true)
		.eq('visibility', 'public')

	if (keys?.length) query = query.in('key', keys)

	const { data, error } = await query

	if (error) {
		console.error('[getPublicConfig]', error)
		return { data: null, error: 'Error al cargar configuración' }
	}

	const result = Object.fromEntries(
		(data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]),
	)
	return { data: result, error: null }
}

export async function getAdminConfig(): Promise<
	DataResult<SiteConfigRecord[]>
> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('site_config')
		.select(
			'id, store_id, key, value, is_active, visibility, description, updated_by, created_at, updated_at',
		)
		.eq('store_id', storeId)
		.order('key')

	if (error) {
		console.error('[getAdminConfig]', error)
		return { data: null, error: 'Error al cargar configuración admin' }
	}
	return { data, error: null }
}

export async function getConfigByKey<T = unknown>(
	key: string,
): Promise<DataResult<T>> {
	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data, error } = await db
		.from('site_config')
		.select('value')
		.eq('store_id', storeId)
		.eq('key', key)
		.single()

	if (error) {
		console.error('[getConfigByKey]', key, error)
		return { data: null, error: `Clave '${key}' no encontrada` }
	}
	return { data: data.value as T, error: null }
}

// ---------------------------------------------------------------------------
// Legacy-compatible getSiteConfig (same signature as lib/services/site-config-server)
// ---------------------------------------------------------------------------

export async function getSiteConfig<T>(key: string): Promise<{
	value: T
	is_active: boolean
	description: string | null
} | null> {
	try {
		const supabase = await createClient()
		const { storeId } = await getPublicStoreContext()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const db = supabase as any
		const { data, error } = await db
			.from('site_config')
			.select('value, is_active, description')
			.eq('store_id', storeId)
			.eq('key', key)
			.maybeSingle()

		if (error || !data) return null
		return {
			value: data.value as unknown as T,
			is_active: data.is_active ?? true,
			description: data.description ?? null,
		}
	} catch (e) {
		console.error(`[getSiteConfig] key=${key}`, e)
		return null
	}
}

// ---------------------------------------------------------------------------
// Config-domain types (kept here to avoid importing from lib/services/)
// ---------------------------------------------------------------------------

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

export type { HeroCTAConfig } from '@/lib/validation/hero-cta'

export type HeroLayoutPreset =
	| 'editorial-left'
	| 'centered'
	| 'product-right'
	| 'fullbleed-bottom'

export interface HomeHeroBannerConfig {
	badge: string
	title: string
	description: string
	cta: import('@/lib/validation/hero-cta').HeroCTAConfig
	background_image: string
	background_image_mobile?: string
	background_video_url?: string
	linked_drop_id?: string
	drop_ended_text?: string
	drop_live_badge_text?: string
	drop_countdown_bg_color?: string
	drop_countdown_text_color?: string
	drop_live_badge_bg_color?: string
	drop_live_badge_text_color?: string
	drop_display_mode?:
		| 'auto'
		| 'message-only'
		| 'countdown-only'
		| 'badge-only'
		| 'hidden'
	drop_message_template_scheduled?: string
	drop_message_template_live?: string
	drop_message_template_ended?: string
	drop_text_alignment?: 'left' | 'center' | 'right'
	drop_date_format?: 'short' | 'long' | 'full'
	drop_show_cta_scheduled?: boolean
	drop_show_cta_live?: boolean
	drop_show_cta_ended?: boolean
	drop_show_countdown?: boolean
	drop_show_live_badge?: boolean
	hero_badge_pos_x?: number
	hero_badge_pos_y?: number
	hero_title_pos_x?: number
	hero_title_pos_y?: number
	hero_description_pos_x?: number
	hero_description_pos_y?: number
	hero_drop_message_pos_x?: number
	hero_drop_message_pos_y?: number
	hero_countdown_pos_x?: number
	hero_countdown_pos_y?: number
	hero_live_badge_pos_x?: number
	hero_live_badge_pos_y?: number
	hero_text_pos_x?: number
	hero_text_pos_y?: number
	hero_cta_pos_x?: number
	hero_cta_pos_y?: number
	title_color: string
	description_color?: string
	badge_color: string
	title_font_weight?: 'bold' | 'black' | 'outline'
	overlay_opacity: number
	content_alignment: 'left' | 'center' | 'right'
	banner_height: 'normal' | 'large' | 'fullscreen'
	layout_preset?: HeroLayoutPreset
}
