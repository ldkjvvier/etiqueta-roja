'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/data/admin-context'
import {
	PromoBannerConfig,
	ContactInfoConfig,
	HomeHeroBannerConfig,
} from '@/lib/data/site-config'
import { parseHeroCTAConfig } from '@/lib/validation/hero-cta'
import { validateHeroForSave } from '@/lib/hero/validation'
import {
	STORE_SETTINGS_CURRENCY,
	STORE_SETTINGS_TIMEZONE,
	storeSettingsSchema,
} from '@/lib/validation/store-settings'
import type { Database } from '@/lib/supabase/types'
import { z } from 'zod'

type SiteConfigInsert =
	Database['public']['Tables']['site_config']['Insert']
type SiteConfigJson =
	Database['public']['Tables']['site_config']['Row']['value']

const ALLOWED_GENERIC_SITE_CONFIG_KEYS = new Set([
	'social_links',
	'announcement_bar',
	'store_settings',
])

const optionalUrlSchema = z
	.string()
	.trim()
	.refine(
		(value) => {
			if (!value) return true
			try {
				const parsed = new URL(value)
				return (
					parsed.protocol === 'https:' || parsed.protocol === 'http:'
				)
			} catch {
				return false
			}
		},
		{ message: 'URL inválida' },
	)

const hexColorSchema = z
	.string()
	.trim()
	.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color inválido')

const socialLinksSchema = z.object({
	instagram: optionalUrlSchema,
	tiktok: optionalUrlSchema,
	twitter: optionalUrlSchema,
	facebook: optionalUrlSchema,
})

const announcementBarSchema = z.object({
	message: z.string().trim().min(1).max(140),
	ctaText: z.string().trim().max(40),
	ctaLink: z.string().trim().max(2048),
	backgroundColor: hexColorSchema,
	textColor: hexColorSchema,
})

type SiteConfigVisibility = 'public' | 'private' | 'internal'

async function upsertSiteConfigValue(params: {
	key: string
	value: SiteConfigJson
	description: string | null
	isActive: boolean
	visibility: SiteConfigVisibility
}) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	const payload: SiteConfigInsert = {
		store_id: store.storeId,
		key: params.key,
		value: params.value,
		description: params.description,
		is_active: params.isActive,
		visibility: params.visibility,
		updated_by: user.id,
		updated_at: new Date().toISOString(),
	}

	const { error } = await supabase
		.from('site_config')
		.upsert(payload as never, { onConflict: 'store_id,key' })

	if (error) {
		console.error(
			`Error updating site config (${params.key}):`,
			error,
		)
		return {
			message: 'No se pudo guardar la configuración',
			error: true,
		}
	}

	revalidatePath('/admin/config')
	revalidatePath('/', 'layout')
	return {
		message: 'Configuración guardada correctamente',
		error: false,
	}
}

export async function updateSocialLinksConfig(
	_prevState: unknown,
	formData: FormData,
) {
	const parsed = socialLinksSchema.safeParse({
		instagram: String(formData.get('instagram') || ''),
		tiktok: String(formData.get('tiktok') || ''),
		twitter: String(formData.get('twitter') || ''),
		facebook: String(formData.get('facebook') || ''),
	})

	if (!parsed.success) {
		return {
			message: 'Revisa las URLs de redes sociales',
			error: true,
		}
	}

	return upsertSiteConfigValue({
		key: 'social_links',
		value: parsed.data as unknown as SiteConfigJson,
		description:
			String(formData.get('description') || '').trim() || null,
		isActive:
			formData.get('is_active') === 'on' ||
			formData.get('is_active') === 'true',
		visibility: 'public',
	})
}

export async function updateAnnouncementBarConfig(
	_prevState: unknown,
	formData: FormData,
) {
	const parsed = announcementBarSchema.safeParse({
		message: String(formData.get('message') || ''),
		ctaText: String(formData.get('cta_text') || ''),
		ctaLink: String(formData.get('cta_link') || ''),
		backgroundColor:
			String(formData.get('background_color') || '#111111') ||
			'#111111',
		textColor:
			String(formData.get('text_color') || '#FFFFFF') || '#FFFFFF',
	})

	if (!parsed.success) {
		return {
			message:
				'Revisa el mensaje, CTA y colores del announcement bar',
			error: true,
		}
	}

	return upsertSiteConfigValue({
		key: 'announcement_bar',
		value: parsed.data as unknown as SiteConfigJson,
		description:
			String(formData.get('description') || '').trim() || null,
		isActive:
			formData.get('is_active') === 'on' ||
			formData.get('is_active') === 'true',
		visibility: 'public',
	})
}

export async function updateStoreSettingsConfig(
	_prevState: unknown,
	formData: FormData,
) {
	const parsed = storeSettingsSchema.safeParse({
		storeName: String(formData.get('store_name') || ''),
		supportEmail: String(formData.get('support_email') || ''),
		currency: STORE_SETTINGS_CURRENCY,
		timezone: STORE_SETTINGS_TIMEZONE,
	})

	if (!parsed.success) {
		return {
			message:
				'Revisa nombre de tienda, email, moneda y zona horaria',
			error: true,
		}
	}

	return upsertSiteConfigValue({
		key: 'store_settings',
		value: parsed.data as unknown as SiteConfigJson,
		description:
			String(formData.get('description') || '').trim() || null,
		isActive:
			formData.get('is_active') === 'on' ||
			formData.get('is_active') === 'true',
		visibility: 'internal',
	})
}

export async function updateGenericSiteConfig(
	_prevState: unknown,
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

	const key = String(formData.get('key') || '').trim()
	if (!ALLOWED_GENERIC_SITE_CONFIG_KEYS.has(key)) {
		return {
			message: 'Clave de configuración no permitida',
			error: true,
		}
	}

	const rawJson = String(formData.get('json_value') || '').trim()
	if (!rawJson) {
		return {
			message: 'Debes enviar un JSON válido',
			error: true,
		}
	}

	let parsedValue: unknown
	try {
		parsedValue = JSON.parse(rawJson)
	} catch {
		return {
			message: 'JSON inválido. Corrige la sintaxis.',
			error: true,
		}
	}

	if (
		!parsedValue ||
		typeof parsedValue !== 'object' ||
		Array.isArray(parsedValue)
	) {
		return {
			message: 'La configuración debe ser un objeto JSON.',
			error: true,
		}
	}

	const description =
		String(formData.get('description') || '').trim() || null
	const isActive =
		formData.get('is_active') === 'on' ||
		formData.get('is_active') === 'true'
	const visibilityRaw = String(formData.get('visibility') || 'public')
	const visibility =
		visibilityRaw === 'private' || visibilityRaw === 'internal'
			? visibilityRaw
			: 'public'

	const payload: SiteConfigInsert = {
		store_id: store.storeId,
		key,
		value: parsedValue as SiteConfigJson,
		description,
		is_active: isActive,
		visibility,
		updated_by: user.id,
		updated_at: new Date().toISOString(),
	}

	const { error } = await supabase
		.from('site_config')
		.upsert(payload as never, { onConflict: 'store_id,key' })

	if (error) {
		console.error(
			`Error updating generic site config (${key}):`,
			error,
		)
		return {
			message: 'No se pudo guardar la configuración',
			error: true,
		}
	}

	revalidatePath('/admin/config')
	revalidatePath('/', 'layout')
	return {
		message: 'Configuración guardada correctamente',
		error: false,
	}
}

export async function updatePromoBanner(
	_prevState: unknown,
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

	const payload: SiteConfigInsert = {
		store_id: store.storeId,
		key: 'promo_banner',
		value: value as unknown as SiteConfigJson,
		description,
		is_active: isActive,
		visibility: 'public',
		updated_by: user.id,
		updated_at: new Date().toISOString(),
	}

	const { error } = await supabase
		.from('site_config')
		.upsert(payload as never, { onConflict: 'store_id,key' })

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
	_prevState: unknown,
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

	const payload: SiteConfigInsert = {
		store_id: store.storeId,
		key: 'contact_info',
		value: value as unknown as SiteConfigJson,
		description,
		is_active: true,
		visibility: 'public',
		updated_by: user.id,
		updated_at: new Date().toISOString(),
	}

	const { error } = await supabase
		.from('site_config')
		.upsert(payload as never, { onConflict: 'store_id,key' })

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
	_prevState: unknown,
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

				const heroValidationResult = validateHeroForSave({
					backgroundImage:
						parsedPayload.value.background_image || '',
					description: parsedPayload.value.description || '',
				})
				if (!heroValidationResult.ok) {
					return {
						message:
							heroValidationResult.errors.backgroundImage ??
							heroValidationResult.errors.description ??
							'Datos del hero inválidos',
						error: true,
					}
				}

				const parsedCta = parseHeroCTAConfig(
					parsedPayload.value.cta,
					{
						ctaText: parsedPayload.value.cta?.text,
						ctaLink: parsedPayload.value.cta?.link,
						buttonBgColor: parsedPayload.value.cta?.backgroundColor,
						buttonTextColor: parsedPayload.value.cta?.textColor,
					},
				)

				if (!parsedCta.success) {
					return {
						message:
							'Configuración CTA inválida. Revisa variantes, tamaños y colores.',
						error: true,
					}
				}

				const value: HomeHeroBannerConfig = {
					...parsedPayload.value,
					cta: parsedCta.data,
					overlay_opacity: Math.max(
						0,
						Math.min(
							100,
							Number(parsedPayload.value.overlay_opacity ?? 45),
						),
					),
				}

				const payload: SiteConfigInsert = {
					store_id: store.storeId,
					key: 'home_hero_banner',
					value: value as unknown as SiteConfigJson,
					description: parsedPayload.internal_description || null,
					is_active: Boolean(parsedPayload.is_active ?? true),
					visibility: 'public',
					updated_by: user.id,
					updated_at: new Date().toISOString(),
				}

				const { error } = await supabase
					.from('site_config')
					.upsert(payload as never, {
						onConflict: 'store_id,key',
					})

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
	const ctaText = (formData.get('ctaContentText') as string) || ''
	const ctaLink = (formData.get('ctaContentLink') as string) || ''
	const ctaVariant =
		(formData.get('cta_variant') as string | null) || undefined
	const ctaSize =
		(formData.get('cta_size') as string | null) || undefined
	const ctaRadius =
		(formData.get('cta_radius') as string | null) || undefined
	const ctaHoverEffect =
		(formData.get('cta_hover_effect') as string | null) || undefined
	const ctaAlignment =
		(formData.get('cta_alignment') as string | null) || undefined
	const ctaFullWidth =
		formData.get('cta_full_width') === 'true' ||
		formData.get('cta_full_width') === 'on'
	const ctaOpenInNewTab =
		formData.get('cta_open_in_new_tab') === 'true' ||
		formData.get('cta_open_in_new_tab') === 'on'
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
	const titleColor =
		(formData.get('title_color') as string) || '#111111'
	const descriptionColor =
		(formData.get('description_color') as string) || '#6B7280'
	const badgeColor =
		(formData.get('badge_color') as string) || '#E62727'
	const buttonBgColor =
		(formData.get('ctaBackgroundColor') as string) || '#E62727'
	const buttonTextColor =
		(formData.get('ctaTextColor') as string) || '#FFFFFF'
	const ctaBorderColor =
		(formData.get('cta_border_color') as string) || buttonBgColor
	const ctaHoverBackgroundColor =
		(formData.get('cta_hover_bg_color') as string) || buttonBgColor
	const ctaHoverTextColor =
		(formData.get('cta_hover_text_color') as string) ||
		buttonTextColor
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
	const layoutPresetRaw = formData.get('layout_preset') as string | null
	const layoutPreset =
		layoutPresetRaw === 'editorial-left' ||
		layoutPresetRaw === 'centered' ||
		layoutPresetRaw === 'product-right' ||
		layoutPresetRaw === 'fullbleed-bottom'
			? layoutPresetRaw
			: 'fullbleed-bottom'
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

	const parsedCta = parseHeroCTAConfig(
		{
			text: ctaText,
			link: ctaLink,
			openInNewTab: ctaOpenInNewTab,
			variant: ctaVariant,
			size: ctaSize,
			radius: ctaRadius,
			hoverEffect: ctaHoverEffect,
			alignment: ctaAlignment,
			fullWidth: ctaFullWidth,
			backgroundColor: buttonBgColor,
			textColor: buttonTextColor,
			borderColor: ctaBorderColor,
			hoverBackgroundColor: ctaHoverBackgroundColor,
			hoverTextColor: ctaHoverTextColor,
		},
		{
			ctaText,
			ctaLink,
			buttonBgColor,
			buttonTextColor,
		},
	)

	if (!parsedCta.success) {
		return {
			message:
				'Configuración CTA inválida. Revisa variantes, tamaños y colores.',
			error: true,
		}
	}

	const value: HomeHeroBannerConfig = {
		badge,
		title,
		description,
		cta: parsedCta.data,
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
		title_font_weight: titleFontWeight,
		overlay_opacity: overlayOpacity,
		content_alignment: contentAlignment,
		banner_height: bannerHeight,
		layout_preset: layoutPreset,
	}

	const payload: SiteConfigInsert = {
		store_id: store.storeId,
		key: 'home_hero_banner',
		value: value as unknown as SiteConfigJson,
		description: internalDescription,
		is_active: isActive,
		visibility: 'public',
		updated_by: user.id,
		updated_at: new Date().toISOString(),
	}

	const { error } = await supabase
		.from('site_config')
		.upsert(payload as never, { onConflict: 'store_id,key' })

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
