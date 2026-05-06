'use client'

import { memo } from 'react'
import { HeroDropPreview } from '@/services/heroDropService'
import { HeroStudioState } from '@/types/heroStudio.types'
import { HeroElementRenderer } from './HeroElementRenderer'
import { Button } from '@/components/ui/button'
import { HeroBannerLayout } from './HeroBannerLayout'

interface HeroCanvasPreviewProps {
	state: HeroStudioState
	dropPreview: HeroDropPreview
	onOpenRealView: () => void
}

function HeroCanvasPreviewComponent({
	state,
	dropPreview,
	onOpenRealView,
}: HeroCanvasPreviewProps) {
	return (
		<section
			className="col-span-12 overflow-auto rounded-lg border bg-card p-4 lg:col-span-6"
			aria-labelledby="hero-canvas-preview-title"
			aria-describedby="hero-canvas-preview-description"
		>
			<div className="mb-3 flex items-center justify-between gap-3">
				<div>
					<h2
						id="hero-canvas-preview-title"
						className="text-sm font-semibold"
					>
						Canvas Preview
					</h2>
					<p
						id="hero-canvas-preview-description"
						className="text-xs text-muted-foreground"
					>
						Vista visual sin drag.
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={onOpenRealView}
				>
					Ver vista en tamaño real
				</Button>
			</div>

			<div className="rounded-xl border bg-secondary p-3">
				<div className="overflow-hidden rounded-lg border bg-secondary">
					<HeroBannerLayout
						bannerHeight={state.layout.bannerHeight}
						overlayOpacity={state.styles.overlayOpacity}
						backgroundImage={state.media.backgroundImage}
						backgroundImageMobile={state.media.backgroundImageMobile}
						backgroundVideoUrl={state.media.backgroundVideoUrl}
						renderEmbeddableVideo
						rootClassName="border-b-0"
					>
						<HeroElementRenderer
							state={state}
							dropPreview={dropPreview}
							dragEnabled={false}
							dragTarget={null}
						/>
					</HeroBannerLayout>
				</div>
			</div>

			<div className="mt-3 space-y-1 text-xs text-muted-foreground">
				{!state.isActive && (
					<p>
						El banner está desactivado y no se mostrará en la home.
					</p>
				)}
				{state.dropConfig.linkedDropId && (
					<p>Drop enlazado: {state.dropConfig.linkedDropId}</p>
				)}
				{dropPreview.status && (
					<p>Estado preview drop: {dropPreview.status}</p>
				)}
				<p>Modo drop: {state.dropConfig.dropDisplayMode}</p>
				{state.cta.link && <p>Destino CTA: {state.cta.link}</p>}
				{state.media.backgroundImageMobile && (
					<p>Imagen mobile configurada</p>
				)}
				{state.media.backgroundVideoUrl && (
					<p>Video de fondo activo</p>
				)}
			</div>
		</section>
	)
}

export const HeroCanvasPreview = memo(HeroCanvasPreviewComponent)
