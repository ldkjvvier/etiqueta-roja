'use client'

import { AlignCenter, Expand, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'

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

	return (
		<HeroSidebarSection
			title="Layout"
			description="Alineación y tamaño visual"
			icon={<LayoutTemplate className="h-4 w-4" />}
		>
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<AlignCenter className="h-4 w-4 text-muted-foreground" />
					<Label>Alineación del contenido</Label>
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
							className={`rounded-lg border p-3 text-left transition ${
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
