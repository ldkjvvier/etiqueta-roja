'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/services/admin-context'
import {
	PromoBannerConfig,
	ContactInfoConfig,
	HomeHeroBannerConfig,
} from '@/lib/services/site-config-server'

export async function updatePromoBanner(
	prevState: any,
	formData: FormData,
) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	// Check auth
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	const message = formData.get('message') as string
	const link = formData.get('link') as string
	const isActive = formData.get('is_active') === 'on'
	const description = (formData.get('description') as string) || null

	const value: PromoBannerConfig = {
		message,
		link: link || null,
	}

	const { error } = await supabase.from('site_config').upsert(
		{
			store_id: store.id,
			key: 'promo_banner',
			value,
			description,
			is_active: isActive,
			visibility: 'public',
			updated_by: user.id,
			updated_at: new Date().toISOString(),
		} as any,
		{ onConflict: 'store_id,key' },
	)

	if (error) {
		console.error('Error updating promo banner:', error)
		return { message: 'Error updating promo banner', error: true }
	}

	revalidatePath('/', 'layout') // Revalidate everything
	return {
		message: 'Promo banner updated successfully',
		error: false,
	}
}

export async function updateContactInfo(
	prevState: any,
	formData: FormData,
) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	// Check auth
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	const whatsapp = formData.get('whatsapp') as string
	const instagram = formData.get('instagram') as string
	const tiktok = formData.get('tiktok') as string
	const email = formData.get('email') as string
	const description = (formData.get('description') as string) || null

	const value: ContactInfoConfig = {
		whatsapp,
		instagram,
		tiktok,
		email,
	}

	const { error } = await supabase.from('site_config').upsert(
		{
			store_id: store.id,
			key: 'contact_info',
			value,
			description,
			is_active: true,
			visibility: 'public',
			updated_by: user.id,
			updated_at: new Date().toISOString(),
		} as any,
		{ onConflict: 'store_id,key' },
	)

	if (error) {
		console.error('Error updating contact info:', error)
		return { message: 'Error updating contact info', error: true }
	}

	revalidatePath('/', 'layout')
	return {
		message: 'Contact info updated successfully',
		error: false,
	}
}

export async function updateHomeHeroBanner(
	prevState: any,
	formData: FormData,
) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	const badge = (formData.get('badge') as string) || ''
	const title = (formData.get('title') as string) || ''
	const description = (formData.get('description') as string) || ''
	const ctaText = (formData.get('cta_text') as string) || ''
	const ctaLink = (formData.get('cta_link') as string) || ''
	const backgroundImage =
		(formData.get('background_image') as string) || ''
	const backgroundImageMobile =
		(formData.get('background_image_mobile') as string) || ''
	const backgroundVideoUrl =
		(formData.get('background_video_url') as string) || ''
	const linkedDropId =
		(formData.get('linked_drop_id') as string) || ''
	const dropEndedText =
		(formData.get('drop_ended_text') as string) || 'SOLD OUT'
	const dropLiveBadgeText =
		(formData.get('drop_live_badge_text') as string) || 'LIVE NOW'
	const dropCountdownBgColor =
		(formData.get('drop_countdown_bg_color') as string) || '#0A0A0A'
	const dropCountdownTextColor =
		(formData.get('drop_countdown_text_color') as string) || '#FFFFFF'
	const dropLiveBadgeBgColor =
		(formData.get('drop_live_badge_bg_color') as string) || '#E62727'
	const dropLiveBadgeTextColor =
		(formData.get('drop_live_badge_text_color') as string) ||
		'#FFFFFF'
	const dropDisplayMode = ((formData.get(
		'drop_display_mode',
	) as string) || 'auto') as
		| 'auto'
		| 'message-only'
		| 'countdown-only'
		| 'badge-only'
		| 'hidden'
	const dropMessageTemplateScheduled =
		(formData.get('drop_message_template_scheduled') as string) ||
		'Drop starts on {date_short} at {time_12}'
	const dropMessageTemplateLive =
		(formData.get('drop_message_template_live') as string) ||
		'Drop live now'
	const dropMessageTemplateEnded =
		(formData.get('drop_message_template_ended') as string) ||
		'Drop finished on {date_short}'
	const dropTextAlignment = ((formData.get(
		'drop_text_alignment',
	) as string) || 'left') as 'left' | 'center' | 'right'
	const dropDateFormat = ((formData.get(
		'drop_date_format',
	) as string) || 'long') as 'short' | 'long' | 'full'
	const dropShowCtaScheduled =
		(formData.get('drop_show_cta_scheduled') as string) !== 'false'
	const dropShowCtaLive =
		(formData.get('drop_show_cta_live') as string) !== 'false'
	const dropShowCtaEnded =
		(formData.get('drop_show_cta_ended') as string) !== 'false'
	const dropShowCountdown =
		(formData.get('drop_show_countdown') as string) !== 'false'
	const dropShowLiveBadge =
		(formData.get('drop_show_live_badge') as string) !== 'false'
	const titleColor =
		(formData.get('title_color') as string) || '#111111'
	const descriptionColor =
		(formData.get('description_color') as string) || '#6B7280'
	const badgeColor =
		(formData.get('badge_color') as string) || '#E62727'
	const buttonBgColor =
		(formData.get('button_bg_color') as string) || '#E62727'
	const buttonTextColor =
		(formData.get('button_text_color') as string) || '#FFFFFF'
	const titleFontWeight = ((formData.get(
		'title_font_weight',
	) as string) || 'black') as 'bold' | 'black' | 'outline'
	const overlayRaw = Number(formData.get('overlay_opacity') || 45)
	const overlayOpacity = Number.isFinite(overlayRaw)
		? Math.max(0, Math.min(100, overlayRaw))
		: 45
	const contentAlignment = ((formData.get(
		'content_alignment',
	) as string) || 'left') as 'left' | 'center' | 'right'
	const bannerHeight = ((formData.get('banner_height') as string) ||
		'normal') as 'normal' | 'large' | 'fullscreen'
	const isActive = formData.get('is_active') === 'on'
	const internalDescription =
		(formData.get('internal_description') as string) || null

	const isValidExternalVideoUrl = (url: string) => {
		if (!url.trim()) {
			return true
		}

		try {
			const parsed = new URL(url)
			return (
				parsed.protocol === 'http:' || parsed.protocol === 'https:'
			)
		} catch {
			return false
		}
	}

	if (!isValidExternalVideoUrl(backgroundVideoUrl)) {
		return {
			message:
				'La URL del video de fondo debe ser externa y comenzar con http:// o https://',
			error: true,
		}
	}

	const value: HomeHeroBannerConfig = {
		badge,
		title,
		description,
		cta_text: ctaText,
		cta_link: ctaLink,
		background_image: backgroundImage,
		background_image_mobile: backgroundImageMobile,
		background_video_url: backgroundVideoUrl,
		linked_drop_id: linkedDropId,
		drop_ended_text: dropEndedText,
		drop_live_badge_text: dropLiveBadgeText,
		drop_countdown_bg_color: dropCountdownBgColor,
		drop_countdown_text_color: dropCountdownTextColor,
		drop_live_badge_bg_color: dropLiveBadgeBgColor,
		drop_live_badge_text_color: dropLiveBadgeTextColor,
		drop_display_mode: dropDisplayMode,
		drop_message_template_scheduled: dropMessageTemplateScheduled,
		drop_message_template_live: dropMessageTemplateLive,
		drop_message_template_ended: dropMessageTemplateEnded,
		drop_text_alignment: dropTextAlignment,
		drop_date_format: dropDateFormat,
		drop_show_cta_scheduled: dropShowCtaScheduled,
		drop_show_cta_live: dropShowCtaLive,
		drop_show_cta_ended: dropShowCtaEnded,
		drop_show_countdown: dropShowCountdown,
		drop_show_live_badge: dropShowLiveBadge,
		title_color: titleColor,
		description_color: descriptionColor,
		badge_color: badgeColor,
		button_bg_color: buttonBgColor,
		button_text_color: buttonTextColor,
		title_font_weight: titleFontWeight,
		overlay_opacity: overlayOpacity,
		content_alignment: contentAlignment,
		banner_height: bannerHeight,
	}

	const { error } = await supabase.from('site_config').upsert(
		{
			store_id: store.id,
			key: 'home_hero_banner',
			value,
			description: internalDescription,
			is_active: isActive,
			visibility: 'public',
			updated_by: user.id,
			updated_at: new Date().toISOString(),
		} as any,
		{ onConflict: 'store_id,key' },
	)

	if (error) {
		console.error('Error updating home hero banner:', error)
		return { message: 'Error updating hero banner', error: true }
	}

	revalidatePath('/', 'layout')
	return {
		message: 'Home hero banner updated successfully',
		error: false,
	}
}
