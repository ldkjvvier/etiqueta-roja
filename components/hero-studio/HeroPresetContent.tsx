// components/hero-studio/HeroPresetContent.tsx
'use client'

import { HeroDropCountdown } from '@/components/HeroDropCountdown'
import { HeroCTA } from '@/components/hero-studio/HeroCTA'
import {
	HeroLayoutPreset,
	isSplitPreset,
	titleWeightClass,
	type HeroTitleFontWeight,
} from '@/lib/hero/presets'
import type { HeroCTAConfig } from '@/lib/validation/hero-cta'

export interface HeroPresetContentProps {
	preset: HeroLayoutPreset
	badge?: string
	badgeColor: string
	title: string
	titleColor: string
	titleFontWeight: HeroTitleFontWeight
	description?: string
	descriptionColor: string

	showDropMessage: boolean
	dropMessage?: string

	showCountdown: boolean
	countdownTarget?: string | null
	countdownBgColor: string
	countdownTextColor: string

	showLiveBadge: boolean
	liveBadgeText?: string
	liveBadgeBgColor: string
	liveBadgeTextColor: string

	showCta: boolean
	ctaConfig: HeroCTAConfig
	ctaLabel?: string
	ctaHref?: string
	ctaDisabled: boolean
	/** En el preview del Studio el CTA no debe navegar. */
	ctaForceButton?: boolean
}

export function HeroPresetContent(props: HeroPresetContentProps) {
	const split = isSplitPreset(props.preset)
	const alignmentClass =
		props.preset === 'centered'
			? 'items-center text-center'
			: 'items-start text-left'

	return (
		<div className={`flex flex-col gap-5 ${alignmentClass}`}>
			{props.badge && (
				<p
					className="text-sm font-bold tracking-widest"
					style={{ color: props.badgeColor }}
				>
					{props.badge}
				</p>
			)}

			<h1
				className={`max-w-2xl text-balance text-5xl leading-none tracking-tighter md:text-6xl lg:text-7xl ${titleWeightClass(
					props.titleFontWeight,
				)}`}
				style={{ color: props.titleColor }}
			>
				{props.title || 'Título principal del Hero'}
			</h1>

			{props.description && (
				<p
					className="max-w-md text-lg leading-relaxed"
					style={{ color: props.descriptionColor }}
				>
					{props.description}
				</p>
			)}

			{props.showDropMessage && props.dropMessage && (
				<p
					className={`max-w-lg text-sm font-semibold tracking-wide ${
						split ? 'text-muted-foreground' : 'text-white/90'
					}`}
				>
					{props.dropMessage}
				</p>
			)}

			{props.showCountdown && props.countdownTarget && (
				<HeroDropCountdown
					targetDate={props.countdownTarget}
					containerBgColor={props.countdownBgColor}
					unitBgColor="rgba(0,0,0,0.35)"
					textColor={props.countdownTextColor}
				/>
			)}

			{props.showLiveBadge && props.liveBadgeText && (
				<span
					className="inline-flex w-fit px-3 py-1 text-xs font-bold tracking-wider"
					style={{
						backgroundColor: props.liveBadgeBgColor,
						color: props.liveBadgeTextColor,
					}}
				>
					{props.liveBadgeText}
				</span>
			)}

			{props.showCta && props.ctaLabel && props.ctaHref && (
				<div>
					<HeroCTA
						config={props.ctaConfig}
						text={props.ctaLabel}
						href={props.ctaHref}
						disabled={props.ctaDisabled}
						forceButton={props.ctaForceButton}
					/>
				</div>
			)}
		</div>
	)
}
