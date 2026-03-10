import { HomeHeroBannerConfig } from '@/lib/services/site-config-server'
import { HeroCTAConfig } from '@/lib/services/site-config-server'

export type HeroDropStatus = 'scheduled' | 'live' | 'ended'

export type HeroElementType =
	| 'badge'
	| 'title'
	| 'description'
	| 'drop-message'
	| 'countdown'
	| 'live-badge'
	| 'cta'

export type HeroDragTarget = HeroElementType | null

export interface HeroPosition {
	x: number
	y: number
}

export type HeroPositions = Record<HeroElementType, HeroPosition>

export type HeroContentAlignment = 'left' | 'center' | 'right'
export type HeroBannerHeight = 'normal' | 'large' | 'fullscreen'
export type HeroTitleFontWeight = 'bold' | 'black' | 'outline'

export type HeroDropDisplayMode =
	| 'auto'
	| 'message-only'
	| 'countdown-only'
	| 'badge-only'
	| 'hidden'

export interface HeroDropConfig {
	linkedDropId: string
	dropEndedText: string
	dropLiveBadgeText: string
	dropCountdownBgColor: string
	dropCountdownTextColor: string
	dropLiveBadgeBgColor: string
	dropLiveBadgeTextColor: string
	dropDisplayMode: HeroDropDisplayMode
	dropMessageTemplateScheduled: string
	dropMessageTemplateLive: string
	dropMessageTemplateEnded: string
	dropTextAlignment: HeroContentAlignment
	dropDateFormat: 'short' | 'long' | 'full'
	dropShowCtaScheduled: boolean
	dropShowCtaLive: boolean
	dropShowCtaEnded: boolean
	dropShowCountdown: boolean
	dropShowLiveBadge: boolean
}

export interface HeroStudioState {
	isActive: boolean
	internalDescription: string
	content: {
		badge: string
		title: string
		description: string
	}
	media: {
		backgroundImage: string
		backgroundImageMobile: string
		backgroundVideoUrl: string
	}
	cta: {
		text: HeroCTAConfig['text']
		link: HeroCTAConfig['link']
		openInNewTab: HeroCTAConfig['openInNewTab']
		variant: HeroCTAConfig['variant']
		size: HeroCTAConfig['size']
		radius: HeroCTAConfig['radius']
		hoverEffect: HeroCTAConfig['hoverEffect']
		alignment: HeroCTAConfig['alignment']
		fullWidth: HeroCTAConfig['fullWidth']
		backgroundColor: HeroCTAConfig['backgroundColor']
		textColor: HeroCTAConfig['textColor']
		borderColor: HeroCTAConfig['borderColor']
		hoverBackgroundColor: HeroCTAConfig['hoverBackgroundColor']
		hoverTextColor: HeroCTAConfig['hoverTextColor']
	}
	layout: {
		contentAlignment: HeroContentAlignment
		bannerHeight: HeroBannerHeight
	}
	styles: {
		titleColor: string
		descriptionColor: string
		badgeColor: string
		titleFontWeight: HeroTitleFontWeight
		overlayOpacity: number
	}
	dropConfig: HeroDropConfig
	positions: HeroPositions
}

export interface HeroDropOption {
	id: string
	name: string
	status: HeroDropStatus
	start_time: string
	end_time: string | null
}

export type HeroBannerConfig = HomeHeroBannerConfig

export interface HeroSubmitPayload {
	is_active: boolean
	internal_description: string | null
	value: HeroBannerConfig
}

export const HERO_DEFAULT_POSITIONS: HeroPositions = {
	badge: { x: 50, y: 30 },
	title: { x: 50, y: 44 },
	description: { x: 50, y: 58 },
	'drop-message': { x: 50, y: 68 },
	countdown: { x: 50, y: 76 },
	'live-badge': { x: 50, y: 76 },
	cta: { x: 50, y: 78 },
}
