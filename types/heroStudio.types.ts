import { HomeHeroBannerConfig } from '@/lib/data/site-config'
import { HeroCTAConfig } from '@/lib/data/site-config'
import type { HeroContentAlignment, HeroTitleFontWeight, HeroLayoutPreset } from '@/lib/hero/presets'

export type HeroDropStatus = 'scheduled' | 'live' | 'ended'

export type { HeroContentAlignment } from '@/lib/hero/presets'
export type HeroBannerHeight = 'normal' | 'large' | 'fullscreen'
export type { HeroTitleFontWeight } from '@/lib/hero/presets'
export type { HeroLayoutPreset } from '@/lib/hero/presets'

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
	content: {
		badge: string
		title: string
		description: string
		showBadge: boolean
		showTitle: boolean
		showDescription: boolean
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
		show: boolean
	}
	layout: {
		contentAlignment: HeroContentAlignment
		bannerHeight: HeroBannerHeight
		layoutPreset?: HeroLayoutPreset
	}
	styles: {
		titleColor: string
		descriptionColor: string
		badgeColor: string
		titleFontWeight: HeroTitleFontWeight
		overlayOpacity: number
	}
	dropConfig: HeroDropConfig
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
	value: HeroBannerConfig
}

