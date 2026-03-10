import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'
import type { Database } from '@/lib/supabase/types'

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

export type HeroCTAVariant = 'solid' | 'outline' | 'ghost'
export type HeroCTASize = 'sm' | 'md' | 'lg'
export type HeroCTARadius = 'none' | 'sm' | 'md' | 'lg' | 'full'
export type HeroCTAHoverEffect = 'none' | 'lift' | 'scale' | 'invert'
export type HeroCTAAlignment = 'left' | 'center' | 'right'

export interface HeroCTAConfig {
	text: string
	link: string
	openInNewTab: boolean
	variant: HeroCTAVariant
	size: HeroCTASize
	radius: HeroCTARadius
	hoverEffect: HeroCTAHoverEffect
	alignment: HeroCTAAlignment
	fullWidth: boolean
	backgroundColor: string
	textColor: string
	borderColor: string
	hoverBackgroundColor: string
	hoverTextColor: string
}

export interface HomeHeroBannerConfig {
	badge: string
	title: string
	description: string
	cta: HeroCTAConfig
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

export async function getSiteConfig<T>(key: string): Promise<{
	value: T
	is_active: boolean
	description: string | null
} | null> {
	try {
		const supabase = await createClient()
		const store = await getAdminStoreContext()
		const { data, error } = await supabase
			.from('site_config')
			.select('value, is_active, description')
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

		type SiteConfigSelection = Pick<
			Database['public']['Tables']['site_config']['Row'],
			'value' | 'is_active' | 'description'
		>

		const typedData = data as SiteConfigSelection

		// Keep a single explicit cast boundary from JSONB to caller-provided type.
		return {
			value: typedData.value as unknown as T,
			is_active: typedData.is_active ?? true,
			description: typedData.description ?? null,
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
