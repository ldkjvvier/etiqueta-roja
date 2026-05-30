// components/hero-studio/HeroStudioPreview.tsx
'use client'

import { memo } from 'react'
import { HeroDropPreview } from '@/services/heroDropService'
import { HeroStudioState } from '@/types/heroStudio.types'
import { HeroBannerLayout } from './HeroBannerLayout'
import { HeroPresetContent } from './HeroPresetContent'
import { DEFAULT_HERO_PRESET, DEV_HERO_FALLBACK } from '@/lib/hero/presets'

interface HeroStudioPreviewProps {
	state: HeroStudioState
	dropPreview: HeroDropPreview
}

function HeroStudioPreviewComponent({
	state,
	dropPreview,
}: HeroStudioPreviewProps) {
	const preset = state.layout.layoutPreset ?? DEFAULT_HERO_PRESET
	const heroImage = state.media.backgroundImage || DEV_HERO_FALLBACK

	return (
		<section
			className="rounded-lg border bg-card p-4 lg:col-span-7 lg:h-full lg:min-h-0 lg:overflow-auto"
			aria-labelledby="hero-preview-title"
			aria-describedby="hero-preview-description"
		>
			<div className="mb-3">
				<h2 id="hero-preview-title" className="text-sm font-semibold">
					Vista previa
				</h2>
				<p
					id="hero-preview-description"
					className="text-xs text-muted-foreground"
				>
					Refleja exactamente cómo se verá el hero publicado.
				</p>
			</div>

			<div className="overflow-hidden rounded-lg border bg-secondary">
				<HeroBannerLayout
					preset={preset}
					bannerHeight={state.layout.bannerHeight}
					overlayOpacity={state.styles.overlayOpacity}
					backgroundImage={heroImage}
					backgroundImageMobile={
						state.media.backgroundImageMobile || heroImage
					}
					backgroundVideoUrl={state.media.backgroundVideoUrl}
					renderEmbeddableVideo
					rootClassName="border-b-0"
				>
					<HeroPresetContent
						preset={preset}
						contentAlignment={state.layout.contentAlignment}
						showBadge={state.content.showBadge}
						badge={state.content.badge}
						badgeColor={state.styles.badgeColor}
						showTitle={state.content.showTitle}
						title={state.content.title}
						titleColor={state.styles.titleColor}
						titleFontWeight={state.styles.titleFontWeight}
						showDescription={state.content.showDescription}
						description={state.content.description}
						descriptionColor={state.styles.descriptionColor}
						showDropMessage={dropPreview.showMessage}
						dropMessage={dropPreview.message}
						showCountdown={dropPreview.showCountdown}
						countdownTarget={dropPreview.countdownTarget}
						countdownBgColor={state.dropConfig.dropCountdownBgColor}
						countdownTextColor={state.dropConfig.dropCountdownTextColor}
						showLiveBadge={dropPreview.showLiveBadge}
						liveBadgeText={state.dropConfig.dropLiveBadgeText}
						liveBadgeBgColor={state.dropConfig.dropLiveBadgeBgColor}
						liveBadgeTextColor={state.dropConfig.dropLiveBadgeTextColor}
						showCta={dropPreview.showCta && state.cta.show}
						ctaConfig={state.cta}
						ctaLabel={dropPreview.ctaText}
						ctaHref={state.cta.link}
						ctaDisabled={dropPreview.ctaDisabled}
						ctaForceButton
					/>
				</HeroBannerLayout>
			</div>

			<div className="mt-3 space-y-1 text-xs text-muted-foreground">
				{!state.isActive && (
					<p>El banner está desactivado y no se mostrará en la home.</p>
				)}
				{state.dropConfig.linkedDropId && (
					<p>Drop enlazado: {state.dropConfig.linkedDropId}</p>
				)}
				{dropPreview.status && (
					<p>Vista previa del drop: {dropPreview.status}</p>
				)}
				<p>Modo drop: {state.dropConfig.dropDisplayMode}</p>
			</div>
		</section>
	)
}

export const HeroStudioPreview = memo(HeroStudioPreviewComponent)
