'use client'

import { Button } from '@/components/ui/button'
import { HeroDropPreview } from '@/services/heroDropService'
import {
	HeroDropOption,
	HeroStudioState,
} from '@/types/heroStudio.types'

interface HeroPositionControlsProps {
	state: HeroStudioState
	selectedDrop?: HeroDropOption
	dropPreview: HeroDropPreview
	onResetPositions: () => void
}

export function HeroPositionControls({
	state,
	selectedDrop,
	dropPreview,
	onResetPositions,
}: HeroPositionControlsProps) {
	return (
		<aside className="col-span-12 overflow-auto rounded-lg border bg-card p-4 lg:col-span-2">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Ayuda de configuración
			</p>
			<div className="mt-3 space-y-3">
				<div className="rounded-md border bg-muted/20 p-3 text-xs">
					<p className="font-semibold text-foreground">
						Estado actual
					</p>
					<p className="mt-1 text-muted-foreground">
						Drop: {selectedDrop?.name ?? 'Sin drop enlazado'}
					</p>
					<p className="text-muted-foreground">
						Vista previa: {dropPreview.status ?? 'sin estado'}
					</p>
					{selectedDrop?.start_time && (
						<p className="text-muted-foreground">
							Inicio: {dropPreview.dateLabel}{' '}
							{dropPreview.time12Label}
						</p>
					)}
					<p className="text-muted-foreground">
						Badge: {state.positions.badge.x.toFixed(1)}%,{' '}
						{state.positions.badge.y.toFixed(1)}%
					</p>
					<p className="text-muted-foreground">
						Título: {state.positions.title.x.toFixed(1)}%,{' '}
						{state.positions.title.y.toFixed(1)}%
					</p>
					<p className="text-muted-foreground">
						Desc: {state.positions.description.x.toFixed(1)}%,{' '}
						{state.positions.description.y.toFixed(1)}%
					</p>
					<p className="text-muted-foreground">
						Msg drop: {state.positions['drop-message'].x.toFixed(1)}%,{' '}
						{state.positions['drop-message'].y.toFixed(1)}%
					</p>
					<p className="text-muted-foreground">
						Countdown: {state.positions.countdown.x.toFixed(1)}%,{' '}
						{state.positions.countdown.y.toFixed(1)}%
					</p>
					<p className="text-muted-foreground">
						Badge live: {state.positions['live-badge'].x.toFixed(1)}%,{' '}
						{state.positions['live-badge'].y.toFixed(1)}%
					</p>
					<p className="text-muted-foreground">
						CTA: {state.positions.cta.x.toFixed(1)}%,{' '}
						{state.positions.cta.y.toFixed(1)}%
					</p>
					<div className="mt-3">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onResetPositions}
						>
							Restablecer posiciones
						</Button>
					</div>
				</div>

				<div className="rounded-md border bg-muted/20 p-3 text-xs">
					<p className="font-semibold text-foreground">
						Placeholders disponibles
					</p>
					<div className="mt-2 space-y-1 text-muted-foreground">
						<p>
							{'{status}'} → {dropPreview.status ?? '-'}
						</p>
						<p>
							{'{date}'} → {dropPreview.dateLabel || '-'}
						</p>
						<p>
							{'{time}'} / {'{time_12}'} →{' '}
							{dropPreview.time12Label || '-'}
						</p>
						<p>
							{'{time_24}'} → {dropPreview.time24Label || '-'}
						</p>
						<p>
							{'{end_date}'} → {dropPreview.endDateLabel || '-'}
						</p>
						<p>
							{'{end_time_12}'} → {dropPreview.endTime12Label || '-'}
						</p>
						<p>
							{'{end_time_24}'} → {dropPreview.endTime24Label || '-'}
						</p>
						<p>
							{'{start_iso}'} / {'{end_iso}'}
						</p>
					</div>
				</div>

				<div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
					<p className="font-semibold text-foreground">
						Tips rápidos
					</p>
					<p className="mt-1">
						- Usa modo "Solo mensaje" para comunicación editorial.
					</p>
					<p>- Usa {'{date_short}'} para 04/03/2026.</p>
					<p>
						- Combina {'{date_short}'} + {'{time_12}'} para textos
						claros.
					</p>
				</div>
			</div>
		</aside>
	)
}
