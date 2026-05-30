import { useMemo, useReducer } from 'react'
import { HomeHeroBannerConfig } from '@/lib/data/site-config'
import { getHeroCTAConfig } from '@/lib/services/hero-cta-config'
import {
	HeroDropOption,
	HeroStudioState,
} from '@/types/heroStudio.types'

interface UseHeroStudioStateArgs {
	initialData?: HomeHeroBannerConfig
	isActive?: boolean
	initialDescription?: string | null
	dropOptions?: HeroDropOption[]
}

type HeroStudioAction =
	| {
			type: 'setField'
			section:
				| 'content'
				| 'media'
				| 'cta'
				| 'layout'
				| 'styles'
				| 'dropConfig'
			key: string
			value: string | number | boolean
	  }
	| {
			type: 'setTopLevel'
			key: 'isActive' | 'internalDescription'
			value: string | boolean
	  }

function buildInitialState(
	initialData?: HomeHeroBannerConfig,
	isActive?: boolean,
	initialDescription?: string | null,
): HeroStudioState {
	const normalizedCTA = getHeroCTAConfig(initialData)

	return {
		isActive: isActive ?? true,
		internalDescription: initialDescription ?? '',
		content: {
			badge: initialData?.badge ?? '',
			title: initialData?.title ?? '',
			description: initialData?.description ?? '',
			showBadge: initialData?.show_badge ?? true,
			showTitle: initialData?.show_title ?? true,
			showDescription: initialData?.show_description ?? true,
		},
		media: {
			backgroundImage: initialData?.background_image ?? '',
			backgroundImageMobile:
				initialData?.background_image_mobile ?? '',
			backgroundVideoUrl: initialData?.background_video_url ?? '',
		},
		cta: {
			text: normalizedCTA.text,
			link: normalizedCTA.link,
			openInNewTab: normalizedCTA.openInNewTab,
			variant: normalizedCTA.variant,
			size: normalizedCTA.size,
			radius: normalizedCTA.radius,
			hoverEffect: normalizedCTA.hoverEffect,
			alignment: normalizedCTA.alignment,
			fullWidth: normalizedCTA.fullWidth,
			backgroundColor: normalizedCTA.backgroundColor,
			textColor: normalizedCTA.textColor,
			borderColor: normalizedCTA.borderColor,
			hoverBackgroundColor: normalizedCTA.hoverBackgroundColor,
			hoverTextColor: normalizedCTA.hoverTextColor,
			show: initialData?.show_cta ?? true,
		},
		layout: {
			contentAlignment: initialData?.content_alignment ?? 'left',
			bannerHeight: initialData?.banner_height ?? 'normal',
			layoutPreset: initialData?.layout_preset,
		},
		styles: {
			titleColor: initialData?.title_color ?? '#111111',
			descriptionColor: initialData?.description_color ?? '#6B7280',
			badgeColor: initialData?.badge_color ?? '#E62727',
			titleFontWeight: initialData?.title_font_weight ?? 'black',
			overlayOpacity: initialData?.overlay_opacity ?? 45,
		},
		dropConfig: {
			linkedDropId: initialData?.linked_drop_id ?? '',
			dropEndedText: initialData?.drop_ended_text ?? 'SOLD OUT',
			dropLiveBadgeText:
				initialData?.drop_live_badge_text ?? 'LIVE NOW',
			dropCountdownBgColor:
				initialData?.drop_countdown_bg_color ?? '#0A0A0A',
			dropCountdownTextColor:
				initialData?.drop_countdown_text_color ?? '#FFFFFF',
			dropLiveBadgeBgColor:
				initialData?.drop_live_badge_bg_color ?? '#E62727',
			dropLiveBadgeTextColor:
				initialData?.drop_live_badge_text_color ?? '#FFFFFF',
			dropDisplayMode: initialData?.drop_display_mode ?? 'auto',
			dropMessageTemplateScheduled:
				initialData?.drop_message_template_scheduled ??
				'Drop starts on {date_short} at {time_12}',
			dropMessageTemplateLive:
				initialData?.drop_message_template_live ?? 'Drop live now',
			dropMessageTemplateEnded:
				initialData?.drop_message_template_ended ??
				'Drop finished on {date_short}',
			dropTextAlignment: initialData?.drop_text_alignment ?? 'left',
			dropDateFormat: initialData?.drop_date_format ?? 'long',
			dropShowCtaScheduled:
				initialData?.drop_show_cta_scheduled ?? false,
			dropShowCtaLive: initialData?.drop_show_cta_live ?? true,
			dropShowCtaEnded: initialData?.drop_show_cta_ended ?? true,
			dropShowCountdown: initialData?.drop_show_countdown ?? true,
			dropShowLiveBadge: initialData?.drop_show_live_badge ?? true,
		},
	}
}

function heroStudioReducer(
	state: HeroStudioState,
	action: HeroStudioAction,
): HeroStudioState {
	switch (action.type) {
		case 'setField': {
			const sectionValue = state[action.section] as Record<
				string,
				string | number | boolean
			>
			return {
				...state,
				[action.section]: {
					...sectionValue,
					[action.key]: action.value,
				},
			}
		}
		case 'setTopLevel': {
			return {
				...state,
				[action.key]: action.value,
			} as HeroStudioState
		}
		default:
			return state
	}
}

export function useHeroStudioState({
	initialData,
	isActive,
	initialDescription,
	dropOptions,
}: UseHeroStudioStateArgs) {
	const [state, dispatch] = useReducer(
		heroStudioReducer,
		buildInitialState(initialData, isActive, initialDescription),
	)

	const selectedDrop = useMemo(() => {
		return dropOptions?.find(
			(drop) => drop.id === state.dropConfig.linkedDropId,
		)
	}, [dropOptions, state.dropConfig.linkedDropId])

	const submitPayload = useMemo(() => {
		return {
			is_active: state.isActive,
			internal_description: state.internalDescription || null,
			value: {
				badge: state.content.badge,
				title: state.content.title,
				description: state.content.description,
				show_badge: state.content.showBadge,
				show_title: state.content.showTitle,
				show_description: state.content.showDescription,
				show_cta: state.cta.show,
				cta: {
					text: state.cta.text,
					link: state.cta.link,
					openInNewTab: state.cta.openInNewTab,
					variant: state.cta.variant,
					size: state.cta.size,
					radius: state.cta.radius,
					hoverEffect: state.cta.hoverEffect,
					alignment: state.cta.alignment,
					fullWidth: state.cta.fullWidth,
					backgroundColor: state.cta.backgroundColor,
					textColor: state.cta.textColor,
					borderColor: state.cta.borderColor,
					hoverBackgroundColor: state.cta.hoverBackgroundColor,
					hoverTextColor: state.cta.hoverTextColor,
				},
				background_image: state.media.backgroundImage,
				background_image_mobile: state.media.backgroundImageMobile,
				background_video_url: state.media.backgroundVideoUrl,
				linked_drop_id: state.dropConfig.linkedDropId,
				drop_ended_text: state.dropConfig.dropEndedText,
				drop_live_badge_text: state.dropConfig.dropLiveBadgeText,
				drop_countdown_bg_color:
					state.dropConfig.dropCountdownBgColor,
				drop_countdown_text_color:
					state.dropConfig.dropCountdownTextColor,
				drop_live_badge_bg_color:
					state.dropConfig.dropLiveBadgeBgColor,
				drop_live_badge_text_color:
					state.dropConfig.dropLiveBadgeTextColor,
				drop_display_mode: state.dropConfig.dropDisplayMode,
				drop_message_template_scheduled:
					state.dropConfig.dropMessageTemplateScheduled,
				drop_message_template_live:
					state.dropConfig.dropMessageTemplateLive,
				drop_message_template_ended:
					state.dropConfig.dropMessageTemplateEnded,
				drop_text_alignment: state.dropConfig.dropTextAlignment,
				drop_date_format: state.dropConfig.dropDateFormat,
				drop_show_cta_scheduled:
					state.dropConfig.dropShowCtaScheduled,
				drop_show_cta_live: state.dropConfig.dropShowCtaLive,
				drop_show_cta_ended: state.dropConfig.dropShowCtaEnded,
				drop_show_countdown: state.dropConfig.dropShowCountdown,
				drop_show_live_badge: state.dropConfig.dropShowLiveBadge,
				title_color: state.styles.titleColor,
				description_color: state.styles.descriptionColor,
				badge_color: state.styles.badgeColor,
				title_font_weight: state.styles.titleFontWeight,
				overlay_opacity: state.styles.overlayOpacity,
				content_alignment: state.layout.contentAlignment,
				banner_height: state.layout.bannerHeight,
				layout_preset: state.layout.layoutPreset,
			},
		}
	}, [state])

	return {
		state,
		dispatch,
		selectedDrop,
		submitPayload,
	}
}
