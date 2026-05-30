'use client'

import { AlignCenter, Expand, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'
import { HeroLayoutPreset } from '@/types/heroStudio.types'

const LAYOUT_PRESETS: {
	value: HeroLayoutPreset
	label: string
	description: string
	visual: string
}[] = [
	{
		value: 'editorial-left',
		label: 'Editorial',
		description: 'Texto izquierda, foto derecha (50/50)',
		visual: '▐▌',
	},
	{
		value: 'centered',
		label: 'Centrado',
		description: 'Foto full-bleed, copy centrado',
		visual: '▬',
	},
	{
		value: 'product-right',
		label: 'Producto',
		description: 'Foto dominante derecha (40/60)',
		visual: '▐▐▌',
	},
	{
		value: 'fullbleed-bottom',
		label: 'Cine',
		description: 'Foto full-bleed, texto al fondo',
		visual: '▬▄',
	},
]

const ALIGNMENT_OPTIONS = [
	{ value: 'left', label: 'Izquierda' },
	{ value: 'center', label: 'Centro' },
	{ value: 'right', label: 'Derecha' },
] as const

const HEIGHT_OPTIONS = [
	{
		value: 'normal',
		label: 'Normal',
		description: 'Vista compacta para home densa',
		preview: 'h-10',
	},
	{
		value: 'large',
		label: 'Large',
		description: 'Balance entre contenido y producto',
		preview: 'h-14',
	},
	{
		value: 'fullscreen',
		label: 'Fullscreen',
		description: 'Impacto visual total',
		preview: 'h-20',
	},
] as const

export function HeroSectionLayout({
	form,
	setField,
}: HeroSectionProps) {
	const alignment = form.watch('contentAlignment')
	const height = form.watch('bannerHeight')
	const layoutPreset = form.watch('layoutPreset')

	return (
		<HeroSidebarSection
			title="Layout"
			description="Preset de composicion y opciones de layout"
			icon={<LayoutTemplate className="h-4 w-4" />}
		>
			{/* Preset selector */}
			<div className="space-y-2">
				<Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Preset de layout
				</Label>
				<div className="grid grid-cols-2 gap-2">
					{LAYOUT_PRESETS.map((preset) => {
						const isActive = layoutPreset === preset.value
						return (
							<button
								key={preset.value}
								type="button"
								onClick={() => {
									form.setValue('layoutPreset', preset.value)
									setField('layout', 'layoutPreset', preset.value)
								}}
								className={`rounded-none border p-3 text-left transition-all ${
									isActive
										? 'border-primary bg-primary/5 ring-1 ring-primary'
										: 'border-border bg-background hover:bg-muted/40'
								}`}
							>
								<span className="mb-1 block font-mono text-base">
									{preset.visual}
								</span>
								<p className="text-sm font-semibold leading-tight">
									{preset.label}
								</p>
								<p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
									{preset.description}
								</p>
							</button>
						)
					})}
				</div>
				{layoutPreset && (
					<button
						type="button"
						className="w-full text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
						onClick={() => {
							form.setValue('layoutPreset', undefined)
							setField('layout', 'layoutPreset', '')
						}}
					>
						Quitar preset (usar posicionamiento libre)
					</button>
				)}
			</div>

			{/* Alignment — relevant for legacy / fullbleed-bottom / centered */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<AlignCenter className="h-4 w-4 text-muted-foreground" />
					<Label>Alineacion del contenido</Label>
				</div>
				<div className="grid grid-cols-3 gap-2">
					{ALIGNMENT_OPTIONS.map((option) => (
						<Button
							key={option.value}
							type="button"
							variant={
								alignment === option.value ? 'default' : 'outline'
							}
							onClick={() => {
								form.setValue('contentAlignment', option.value)
								setField('layout', 'contentAlignment', option.value)
							}}
						>
							{option.label}
						</Button>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Expand className="h-4 w-4 text-muted-foreground" />
					<Label>Altura del banner</Label>
				</div>
				<div className="grid grid-cols-1 gap-2">
					{HEIGHT_OPTIONS.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => {
								form.setValue('bannerHeight', option.value)
								setField('layout', 'bannerHeight', option.value)
							}}
							className={`rounded-none border p-3 text-left transition ${
								height === option.value
									? 'border-primary bg-primary/10'
									: 'bg-background hover:bg-muted/40'
							}`}
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-semibold">
										{option.label}
									</p>
									<p className="text-xs text-muted-foreground">
										{option.description}
									</p>
								</div>
								<div
									className={`w-16 rounded bg-muted ${option.preview}`}
								/>
							</div>
						</button>
					))}
				</div>
			</div>
		</HeroSidebarSection>
	)
}
