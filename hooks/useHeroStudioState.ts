import { useMemo, useReducer } from 'react'
import { HomeHeroBannerConfig } from '@/lib/services/site-config-server'
import {
	HERO_DEFAULT_POSITIONS,
	HeroDropOption,
	HeroElementType,
	HeroPosition,
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
	| {
			type: 'setPosition'
			element: HeroElementType
			position: HeroPosition
	  }
	| { type: 'resetPositions' }

function buildInitialState(
	initialData?: HomeHeroBannerConfig,
	isActive?: boolean,
	initialDescription?: string | null,
): HeroStudioState {
	return {
		isActive: isActive ?? true,
		internalDescription: initialDescription ?? '',
		content: {
			badge: initialData?.badge ?? '',
			title: initialData?.title ?? '',
			description: initialData?.description ?? '',
		},
		media: {
			backgroundImage: initialData?.background_image ?? '',
			backgroundImageMobile: initialData?.background_image_mobile ?? '',
			backgroundVideoUrl: initialData?.background_video_url ?? '',
		},
		cta: {
			text: initialData?.cta_text ?? '',
			link: initialData?.cta_link ?? '',
		},
		layout: {
			contentAlignment: initialData?.content_alignment ?? 'left',
			bannerHeight: initialData?.banner_height ?? 'normal',
		},
		styles: {
			titleColor: initialData?.title_color ?? '#111111',
			descriptionColor: initialData?.description_color ?? '#6B7280',
			badgeColor: initialData?.badge_color ?? '#E62727',
			buttonBgColor: initialData?.button_bg_color ?? '#E62727',
			buttonTextColor: initialData?.button_text_color ?? '#FFFFFF',
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
		positions: {
			badge: {
				x: initialData?.hero_badge_pos_x ?? HERO_DEFAULT_POSITIONS.badge.x,
				y: initialData?.hero_badge_pos_y ?? HERO_DEFAULT_POSITIONS.badge.y,
			},
			title: {
				x: initialData?.hero_title_pos_x ?? initialData?.hero_text_pos_x ?? HERO_DEFAULT_POSITIONS.title.x,
				y: initialData?.hero_title_pos_y ?? initialData?.hero_text_pos_y ?? HERO_DEFAULT_POSITIONS.title.y,
			},
			description: {
				x: initialData?.hero_description_pos_x ?? initialData?.hero_text_pos_x ?? HERO_DEFAULT_POSITIONS.description.x,
				y: initialData?.hero_description_pos_y ?? initialData?.hero_text_pos_y ?? HERO_DEFAULT_POSITIONS.description.y,
			},
			'drop-message': {
				x: initialData?.hero_drop_message_pos_x ?? HERO_DEFAULT_POSITIONS['drop-message'].x,
				y: initialData?.hero_drop_message_pos_y ?? HERO_DEFAULT_POSITIONS['drop-message'].y,
			},
			countdown: {
				x: initialData?.hero_countdown_pos_x ?? HERO_DEFAULT_POSITIONS.countdown.x,
				y: initialData?.hero_countdown_pos_y ?? HERO_DEFAULT_POSITIONS.countdown.y,
			},
			'live-badge': {
				x: initialData?.hero_live_badge_pos_x ?? HERO_DEFAULT_POSITIONS['live-badge'].x,
				y: initialData?.hero_live_badge_pos_y ?? HERO_DEFAULT_POSITIONS['live-badge'].y,
			},
			cta: {
				x: initialData?.hero_cta_pos_x ?? HERO_DEFAULT_POSITIONS.cta.x,
				y: initialData?.hero_cta_pos_y ?? HERO_DEFAULT_POSITIONS.cta.y,
			},
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
		case 'setPosition': {
			return {
				...state,
				positions: {
					...state.positions,
					[action.element]: action.position,
				},
			}
		}
		case 'resetPositions': {
			return {
				...state,
				positions: HERO_DEFAULT_POSITIONS,
			}
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
				cta_text: state.cta.text,
				cta_link: state.cta.link,
				background_image: state.media.backgroundImage,
				background_image_mobile: state.media.backgroundImageMobile,
				background_video_url: state.media.backgroundVideoUrl,
				linked_drop_id: state.dropConfig.linkedDropId,
				drop_ended_text: state.dropConfig.dropEndedText,
				drop_live_badge_text: state.dropConfig.dropLiveBadgeText,
				drop_countdown_bg_color: state.dropConfig.dropCountdownBgColor,
				drop_countdown_text_color: state.dropConfig.dropCountdownTextColor,
				drop_live_badge_bg_color: state.dropConfig.dropLiveBadgeBgColor,
				drop_live_badge_text_color: state.dropConfig.dropLiveBadgeTextColor,
				drop_display_mode: state.dropConfig.dropDisplayMode,
				drop_message_template_scheduled:
					state.dropConfig.dropMessageTemplateScheduled,
				drop_message_template_live:
					state.dropConfig.dropMessageTemplateLive,
				drop_message_template_ended:
					state.dropConfig.dropMessageTemplateEnded,
				drop_text_alignment: state.dropConfig.dropTextAlignment,
				drop_date_format: state.dropConfig.dropDateFormat,
				drop_show_cta_scheduled: state.dropConfig.dropShowCtaScheduled,
				drop_show_cta_live: state.dropConfig.dropShowCtaLive,
				drop_show_cta_ended: state.dropConfig.dropShowCtaEnded,
				drop_show_countdown: state.dropConfig.dropShowCountdown,
				drop_show_live_badge: state.dropConfig.dropShowLiveBadge,
				hero_badge_pos_x: state.positions.badge.x,
				hero_badge_pos_y: state.positions.badge.y,
				hero_title_pos_x: state.positions.title.x,
				hero_title_pos_y: state.positions.title.y,
				hero_description_pos_x: state.positions.description.x,
				hero_description_pos_y: state.positions.description.y,
				hero_drop_message_pos_x: state.positions['drop-message'].x,
				hero_drop_message_pos_y: state.positions['drop-message'].y,
				hero_countdown_pos_x: state.positions.countdown.x,
				hero_countdown_pos_y: state.positions.countdown.y,
				hero_live_badge_pos_x: state.positions['live-badge'].x,
				hero_live_badge_pos_y: state.positions['live-badge'].y,
				hero_text_pos_x: state.positions.title.x,
				hero_text_pos_y: state.positions.title.y,
				hero_cta_pos_x: state.positions.cta.x,
				hero_cta_pos_y: state.positions.cta.y,
				title_color: state.styles.titleColor,
				description_color: state.styles.descriptionColor,
				badge_color: state.styles.badgeColor,
				button_bg_color: state.styles.buttonBgColor,
				button_text_color: state.styles.buttonTextColor,
				title_font_weight: state.styles.titleFontWeight,
				overlay_opacity: state.styles.overlayOpacity,
				content_alignment: state.layout.contentAlignment,
				banner_height: state.layout.bannerHeight,
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
