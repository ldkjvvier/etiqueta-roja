'use client'

import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SlidersHorizontal } from 'lucide-react'
import {
	HeroDropOption,
	HeroStudioState,
} from '@/types/heroStudio.types'
import {
	getSidebarDefaults,
	HERO_PRESETS,
	heroSidebarSchema,
	HeroSidebarFormValues,
} from './sidebar/hero-sidebar-form'
import { HeroSectionContent } from './sidebar/HeroSectionContent'
import { HeroSectionCTA } from './sidebar/HeroSectionCTA'
import { HeroSectionMedia } from './sidebar/HeroSectionMedia'
import { HeroSectionLayout } from './sidebar/HeroSectionLayout'
import { HeroSectionStyles } from './sidebar/HeroSectionStyles'
import { HeroSectionDropCampaign } from './sidebar/HeroSectionDropCampaign'
import { HeroSectionAdvanced } from './sidebar/HeroSectionAdvanced'

export type HeroControlsDispatch = React.Dispatch<
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
>

interface HeroControlsSidebarProps {
	state: HeroStudioState
	dispatch: HeroControlsDispatch
	dropOptions?: HeroDropOption[]
}

export function HeroControlsSidebar({
	state,
	dispatch,
	dropOptions,
}: HeroControlsSidebarProps) {
	const defaults = useMemo(() => getSidebarDefaults(state), [state])

	const form = useForm<HeroSidebarFormValues>({
		resolver: zodResolver(heroSidebarSchema),
		defaultValues: defaults,
		mode: 'onChange',
	})

	const setField = (
		section:
			| 'content'
			| 'media'
			| 'cta'
			| 'layout'
			| 'styles'
			| 'dropConfig',
		key: string,
		value: string | number | boolean,
	) => {
		dispatch({ type: 'setField', section, key, value })
	}

	const setTopLevel = (
		key: 'isActive' | 'internalDescription',
		value: string | boolean,
	) => {
		dispatch({ type: 'setTopLevel', key, value })
	}

	const syncPresetValue = (
		key: keyof HeroSidebarFormValues,
		value: HeroSidebarFormValues[keyof HeroSidebarFormValues],
	) => {
		form.setValue(key, value as never)

		switch (key) {
			case 'isActive':
				setTopLevel('isActive', value as boolean)
				return
			case 'internalDescription':
				setTopLevel('internalDescription', value as string)
				return
			case 'badge':
			case 'title':
			case 'description':
				setField('content', key, value as string)
				return
			case 'ctaText':
				setField('cta', 'text', value as string)
				return
			case 'ctaLink':
				setField('cta', 'link', value as string)
				return
			case 'ctaOpenInNewTab':
				setField('cta', 'openInNewTab', value as boolean)
				return
			case 'ctaVariant':
				setField('cta', 'variant', value as string)
				return
			case 'ctaSize':
				setField('cta', 'size', value as string)
				return
			case 'ctaRadius':
				setField('cta', 'radius', value as string)
				return
			case 'ctaHoverEffect':
				setField('cta', 'hoverEffect', value as string)
				return
			case 'ctaAlignment':
				setField('cta', 'alignment', value as string)
				return
			case 'ctaFullWidth':
				setField('cta', 'fullWidth', value as boolean)
				return
			case 'ctaBackgroundColor':
				setField('cta', 'backgroundColor', value as string)
				return
			case 'ctaTextColor':
				setField('cta', 'textColor', value as string)
				return
			case 'ctaBorderColor':
				setField('cta', 'borderColor', value as string)
				return
			case 'ctaHoverBackgroundColor':
				setField('cta', 'hoverBackgroundColor', value as string)
				return
			case 'ctaHoverTextColor':
				setField('cta', 'hoverTextColor', value as string)
				return
			case 'backgroundImage':
				setField('media', 'backgroundImage', value as string)
				return
			case 'backgroundImageMobile':
				setField('media', 'backgroundImageMobile', value as string)
				return
			case 'backgroundVideoUrl':
				setField('media', 'backgroundVideoUrl', value as string)
				return
			case 'contentAlignment':
				setField('layout', 'contentAlignment', value as string)
				return
			case 'bannerHeight':
				setField('layout', 'bannerHeight', value as string)
				return
			case 'overlayOpacity':
				setField('styles', 'overlayOpacity', value as number)
				return
			case 'titleColor':
			case 'descriptionColor':
			case 'badgeColor':
			case 'titleFontWeight':
				setField('styles', key, value as string)
				return
			case 'linkedDropId':
			case 'dropDisplayMode':
			case 'dropTextAlignment':
			case 'dropDateFormat':
			case 'dropMessageTemplateScheduled':
			case 'dropMessageTemplateLive':
			case 'dropMessageTemplateEnded':
			case 'dropLiveBadgeText':
			case 'dropEndedText':
			case 'dropCountdownBgColor':
			case 'dropCountdownTextColor':
			case 'dropLiveBadgeBgColor':
			case 'dropLiveBadgeTextColor':
				setField('dropConfig', key, value as string)
				return
			case 'dropShowCtaScheduled':
			case 'dropShowCtaLive':
			case 'dropShowCtaEnded':
			case 'dropShowCountdown':
			case 'dropShowLiveBadge':
				setField('dropConfig', key, value as boolean)
				return
			default:
				return
		}
	}

	const applyPreset = (presetId: string) => {
		const preset = HERO_PRESETS.find((item) => item.id === presetId)
		if (!preset) {
			return
		}

		for (const [key, value] of Object.entries(preset.values)) {
			syncPresetValue(
				key as keyof HeroSidebarFormValues,
				value as HeroSidebarFormValues[keyof HeroSidebarFormValues],
			)
		}
	}

	return (
		<aside className="col-span-12 overflow-auto rounded-lg border bg-card p-4 lg:col-span-4">
			<div className="mb-4 rounded-xl border bg-muted/30 p-4">
				<div className="flex items-center gap-2">
					<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
					<p className="text-sm font-semibold">
						Hero Configuration Studio
					</p>
				</div>
				<p className="mt-1 text-xs text-muted-foreground">
					Flujo optimizado tipo Shopify/Webflow con secciones
					colapsables y presets.
				</p>
			</div>

			<div className="space-y-3">
				<HeroSectionContent
					form={form}
					setField={setField}
					setTopLevel={setTopLevel}
					applyPreset={applyPreset}
				/>
				<HeroSectionMedia
					form={form}
					setField={setField}
					setTopLevel={setTopLevel}
				/>
				<HeroSectionLayout
					form={form}
					setField={setField}
					setTopLevel={setTopLevel}
				/>
				<HeroSectionCTA
					form={form}
					setField={setField}
					setTopLevel={setTopLevel}
				/>
				<HeroSectionDropCampaign
					form={form}
					setField={setField}
					setTopLevel={setTopLevel}
					dropOptions={dropOptions}
				/>
				<HeroSectionStyles
					form={form}
					setField={setField}
					setTopLevel={setTopLevel}
				/>
				<HeroSectionAdvanced
					form={form}
					setField={setField}
					setTopLevel={setTopLevel}
				/>
			</div>
		</aside>
	)
}
