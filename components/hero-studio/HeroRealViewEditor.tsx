'use client'

import { useEffect } from 'react'
import { Header } from '@/components/header'
import { StoreProvider } from '@/lib/store-context'
import { HeroDropPreview } from '@/services/heroDropService'
import {
	HeroElementType,
	HeroStudioState,
} from '@/types/heroStudio.types'
import { HeroElementRenderer } from './HeroElementRenderer'
import { Button } from '@/components/ui/button'
import { useHeroDragEditor } from '@/hooks/useHeroDragEditor'
import { HeroBannerLayout } from './HeroBannerLayout'

interface HeroRealViewEditorProps {
	open: boolean
	state: HeroStudioState
	dropPreview: HeroDropPreview
	onClose: () => void
	onPositionChange: (
		target: HeroElementType,
		x: number,
		y: number,
	) => void
}

export function HeroRealViewEditor({
	open,
	state,
	dropPreview,
	onClose,
	onPositionChange,
}: HeroRealViewEditorProps) {
	const drag = useHeroDragEditor({
		positions: state.positions,
		enabled: open,
		onPositionChange: (target, position) => {
			onPositionChange(target, position.x, position.y)
		},
	})

	useEffect(() => {
		if (!open) {
			drag.clearDrag()
			return
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}
		window.addEventListener('keydown', onKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', onKeyDown)
		}
	}, [drag, onClose, open])

	if (!open) {
		return null
	}

	return (
		<div className="fixed inset-0 z-80 bg-black/80 p-4">
			<div className="flex h-full flex-col overflow-hidden rounded-xl border bg-background">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<div>
						<p className="text-sm font-semibold">
							Vista real (drag habilitado)
						</p>
						<p className="text-xs text-muted-foreground">
							Posiciona elementos como se verán en el sitio.
						</p>
					</div>
					<Button type="button" variant="outline" onClick={onClose}>
						Cerrar vista real
					</Button>
				</div>

				<div className="flex-1 overflow-auto bg-muted/40">
					<StoreProvider>
						<Header />
					</StoreProvider>

					<HeroBannerLayout
						bannerHeight={state.layout.bannerHeight}
						overlayOpacity={state.styles.overlayOpacity}
						backgroundImage={state.media.backgroundImage}
						backgroundImageMobile={state.media.backgroundImageMobile}
						backgroundVideoUrl={state.media.backgroundVideoUrl}
						canvasRef={drag.canvasRef}
						onCanvasPointerMove={drag.onCanvasPointerMove}
						onCanvasPointerUp={drag.onCanvasPointerUp}
						onCanvasPointerLeave={drag.onCanvasPointerUp}
						canvasClassName="overflow-hidden"
					>
						<HeroElementRenderer
							state={state}
							dropPreview={dropPreview}
							dragEnabled
							dragTarget={drag.dragTarget}
							getDragProps={drag.getDraggableProps}
						/>
					</HeroBannerLayout>
				</div>
			</div>
		</div>
	)
}
