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

	const heroPayloadRaw = formData.get('hero_payload')
	if (typeof heroPayloadRaw === 'string' && heroPayloadRaw.trim()) {
		try {
			const parsedPayload = JSON.parse(heroPayloadRaw) as {
				is_active?: boolean
				internal_description?: string | null
				value?: HomeHeroBannerConfig
			}

			if (parsedPayload?.value) {
				const isValidExternalVideoUrl = (url: string) => {
					if (!url.trim()) {
						return true
					}

					try {
						const parsed = new URL(url)
						return (
							parsed.protocol === 'http:' ||
							parsed.protocol === 'https:'
						)
					} catch {
						return false
					}
				}

				if (
					!isValidExternalVideoUrl(
						parsedPayload.value.background_video_url || '',
					)
				) {
					return {
						message:
							'La URL del video de fondo debe ser externa y comenzar con http:// o https://',
						error: true,
					}
				}

				const value: HomeHeroBannerConfig = {
					...parsedPayload.value,
					hero_badge_pos_x: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_badge_pos_x ?? 50),
						),
					),
					hero_badge_pos_y: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_badge_pos_y ?? 30),
						),
					),
					hero_title_pos_x: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_title_pos_x ?? 50),
						),
					),
					hero_title_pos_y: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_title_pos_y ?? 44),
						),
					),
					hero_description_pos_x: Math.max(
						0,
						Math.min(
							100,
							Number(
								parsedPayload.value.hero_description_pos_x ?? 50,
							),
						),
					),
					hero_description_pos_y: Math.max(
						0,
						Math.min(
							100,
							Number(
								parsedPayload.value.hero_description_pos_y ?? 58,
							),
						),
					),
					hero_drop_message_pos_x: Math.max(
						0,
						Math.min(
							100,
							Number(
								parsedPayload.value.hero_drop_message_pos_x ?? 50,
							),
						),
					),
					hero_drop_message_pos_y: Math.max(
						0,
						Math.min(
							100,
							Number(
								parsedPayload.value.hero_drop_message_pos_y ?? 68,
							),
						),
					),
					hero_countdown_pos_x: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_countdown_pos_x ?? 50),
						),
					),
					hero_countdown_pos_y: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_countdown_pos_y ?? 76),
						),
					),
					hero_live_badge_pos_x: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_live_badge_pos_x ?? 50),
						),
					),
					hero_live_badge_pos_y: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_live_badge_pos_y ?? 76),
						),
					),
					hero_cta_pos_x: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_cta_pos_x ?? 50),
						),
					),
					hero_cta_pos_y: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.hero_cta_pos_y ?? 78),
						),
					),
					hero_text_pos_x: Math.max(
						0,
						Math.min(
							100,
							Number(
								parsedPayload.value.hero_text_pos_x ??
									parsedPayload.value.hero_title_pos_x ??
									50,
							),
						),
					),
					hero_text_pos_y: Math.max(
						0,
						Math.min(
							100,
							Number(
								parsedPayload.value.hero_text_pos_y ??
									parsedPayload.value.hero_title_pos_y ??
									44,
							),
						),
					),
					overlay_opacity: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.overlay_opacity ?? 45),
						),
					),
				}

				const { error } = await supabase.from('site_config').upsert(
					{
						store_id: store.id,
						key: 'home_hero_banner',
						value,
						description: parsedPayload.internal_description || null,
						is_active: Boolean(parsedPayload.is_active ?? true),
						visibility: 'public',
						updated_by: user.id,
						updated_at: new Date().toISOString(),
					} as any,
					{ onConflict: 'store_id,key' },
				)

				if (error) {
					console.error('Error updating home hero banner:', error)
					return {
						message: 'Error updating hero banner',
						error: true,
					}
				}

				revalidatePath('/', 'layout')
				return {
					message: 'Home hero banner updated successfully',
					error: false,
				}
			}
		} catch (error) {
			console.error('Invalid hero payload received:', error)
		}
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
		(formData.get('drop_message_template_scheduled') as
			| string
			| null) ?? 'Drop starts on {date_short} at {time_12}'
	const dropMessageTemplateLive =
		(formData.get('drop_message_template_live') as string | null) ??
		'Drop live now'
	const dropMessageTemplateEnded =
		(formData.get('drop_message_template_ended') as string | null) ??
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
	const heroBadgePosXRaw = Number(
		formData.get('hero_badge_pos_x') || 50,
	)
	const heroBadgePosYRaw = Number(
		formData.get('hero_badge_pos_y') || 30,
	)
	const heroTitlePosXRaw = Number(
		formData.get('hero_title_pos_x') || 50,
	)
	const heroTitlePosYRaw = Number(
		formData.get('hero_title_pos_y') || 44,
	)
	const heroDescriptionPosXRaw = Number(
		formData.get('hero_description_pos_x') || 50,
	)
	const heroDescriptionPosYRaw = Number(
		formData.get('hero_description_pos_y') || 58,
	)
	const heroDropMessagePosXRaw = Number(
		formData.get('hero_drop_message_pos_x') || 50,
	)
	const heroDropMessagePosYRaw = Number(
		formData.get('hero_drop_message_pos_y') || 68,
	)
	const heroCountdownPosXRaw = Number(
		formData.get('hero_countdown_pos_x') || 50,
	)
	const heroCountdownPosYRaw = Number(
		formData.get('hero_countdown_pos_y') || 76,
	)
	const heroLiveBadgePosXRaw = Number(
		formData.get('hero_live_badge_pos_x') || 50,
	)
	const heroLiveBadgePosYRaw = Number(
		formData.get('hero_live_badge_pos_y') || 76,
	)
	const heroTextPosXRaw = Number(
		formData.get('hero_text_pos_x') || 50,
	)
	const heroTextPosYRaw = Number(
		formData.get('hero_text_pos_y') || 48,
	)
	const heroCtaPosXRaw = Number(formData.get('hero_cta_pos_x') || 50)
	const heroCtaPosYRaw = Number(formData.get('hero_cta_pos_y') || 78)
	const heroBadgePosX = Number.isFinite(heroBadgePosXRaw)
		? Math.max(0, Math.min(100, heroBadgePosXRaw))
		: 50
	const heroBadgePosY = Number.isFinite(heroBadgePosYRaw)
		? Math.max(0, Math.min(100, heroBadgePosYRaw))
		: 30
	const heroTitlePosX = Number.isFinite(heroTitlePosXRaw)
		? Math.max(0, Math.min(100, heroTitlePosXRaw))
		: 50
	const heroTitlePosY = Number.isFinite(heroTitlePosYRaw)
		? Math.max(0, Math.min(100, heroTitlePosYRaw))
		: 44
	const heroDescriptionPosX = Number.isFinite(heroDescriptionPosXRaw)
		? Math.max(0, Math.min(100, heroDescriptionPosXRaw))
		: 50
	const heroDescriptionPosY = Number.isFinite(heroDescriptionPosYRaw)
		? Math.max(0, Math.min(100, heroDescriptionPosYRaw))
		: 58
	const heroDropMessagePosX = Number.isFinite(heroDropMessagePosXRaw)
		? Math.max(0, Math.min(100, heroDropMessagePosXRaw))
		: 50
	const heroDropMessagePosY = Number.isFinite(heroDropMessagePosYRaw)
		? Math.max(0, Math.min(100, heroDropMessagePosYRaw))
		: 68
	const heroCountdownPosX = Number.isFinite(heroCountdownPosXRaw)
		? Math.max(0, Math.min(100, heroCountdownPosXRaw))
		: 50
	const heroCountdownPosY = Number.isFinite(heroCountdownPosYRaw)
		? Math.max(0, Math.min(100, heroCountdownPosYRaw))
		: 76
	const heroLiveBadgePosX = Number.isFinite(heroLiveBadgePosXRaw)
		? Math.max(0, Math.min(100, heroLiveBadgePosXRaw))
		: 50
	const heroLiveBadgePosY = Number.isFinite(heroLiveBadgePosYRaw)
		? Math.max(0, Math.min(100, heroLiveBadgePosYRaw))
		: 76
	const heroTextPosX = Number.isFinite(heroTextPosXRaw)
		? Math.max(0, Math.min(100, heroTextPosXRaw))
		: 50
	const heroTextPosY = Number.isFinite(heroTextPosYRaw)
		? Math.max(0, Math.min(100, heroTextPosYRaw))
		: 48
	const heroCtaPosX = Number.isFinite(heroCtaPosXRaw)
		? Math.max(0, Math.min(100, heroCtaPosXRaw))
		: 50
	const heroCtaPosY = Number.isFinite(heroCtaPosYRaw)
		? Math.max(0, Math.min(100, heroCtaPosYRaw))
		: 78
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
		hero_badge_pos_x: heroBadgePosX,
		hero_badge_pos_y: heroBadgePosY,
		hero_title_pos_x: heroTitlePosX,
		hero_title_pos_y: heroTitlePosY,
		hero_description_pos_x: heroDescriptionPosX,
		hero_description_pos_y: heroDescriptionPosY,
		hero_drop_message_pos_x: heroDropMessagePosX,
		hero_drop_message_pos_y: heroDropMessagePosY,
		hero_countdown_pos_x: heroCountdownPosX,
		hero_countdown_pos_y: heroCountdownPosY,
		hero_live_badge_pos_x: heroLiveBadgePosX,
		hero_live_badge_pos_y: heroLiveBadgePosY,
		hero_text_pos_x: heroTextPosX,
		hero_text_pos_y: heroTextPosY,
		hero_cta_pos_x: heroCtaPosX,
		hero_cta_pos_y: heroCtaPosY,
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
