'use client'

import { Palette, Type, Zap } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { HERO_PRESETS } from './hero-sidebar-form'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'
import {
	countWords,
	MAX_SUBTITLE_WORDS,
	TITLE_SOFT_MAX,
} from '@/lib/hero/validation'

export function HeroSectionContent({
	form,
	setField,
	setTopLevel,
	applyPreset,
}: HeroSectionProps) {
	const isActive = form.watch('isActive')
	const badge = form.watch('badge')
	const title = form.watch('title')
	const description = form.watch('description')
	const descriptionWordCount = countWords(description ?? '')
	const descriptionOverLimit =
		descriptionWordCount > MAX_SUBTITLE_WORDS
	const titleTooLong = (title?.length ?? 0) > TITLE_SOFT_MAX

	return (
		<HeroSidebarSection
			title="Content"
			description="Copy, tono editorial y presets"
			icon={<Type className="h-4 w-4" />}
		>
			<div className="rounded-lg border bg-background p-3">
				<div className="mb-3 flex items-center justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Estado del módulo
						</p>
						<p className="text-sm font-medium">Banner principal</p>
					</div>
					<div className="flex items-center gap-2">
						<Switch
							id="hero_is_active"
							checked={isActive}
							onCheckedChange={(checked) => {
								form.setValue('isActive', checked)
								setTopLevel('isActive', checked)
							}}
						/>
						<Label htmlFor="hero_is_active" className="text-xs">
							{isActive ? 'Activo' : 'Inactivo'}
						</Label>
					</div>
				</div>
				<p className="text-xs text-muted-foreground">
					Activa o pausa el hero sin perder configuración.
				</p>
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Zap className="h-4 w-4 text-muted-foreground" />
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Presets
					</p>
				</div>
				<div className="grid grid-cols-1 gap-2">
					{HERO_PRESETS.map((preset) => (
						<Button
							key={preset.id}
							type="button"
							variant="outline"
							className="h-auto justify-start whitespace-normal text-left"
							onClick={() => applyPreset?.(preset.id)}
						>
							<div>
								<p className="text-sm font-semibold">{preset.name}</p>
								<p className="text-xs text-muted-foreground">
									{preset.description}
								</p>
							</div>
						</Button>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="badge">Pre-título (Badge)</Label>
				<Input
					id="badge"
					{...form.register('badge', {
						onChange: (event) =>
							setField('content', 'badge', event.target.value),
					})}
					placeholder="DROP EXCLUSIVO — EDICIÓN LIMITADA"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="title">Título Principal</Label>
				<Input
					id="title"
					{...form.register('title', {
						onChange: (event) =>
							setField('content', 'title', event.target.value),
					})}
				/>
				{titleTooLong && (
					<p className="text-xs text-amber-600">
						Título largo: puede superar 2 líneas en mobile.
					</p>
				)}
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Descripción</Label>
				<Textarea
					id="description"
					className="min-h-20"
					{...form.register('description', {
						onChange: (event) =>
							setField('content', 'description', event.target.value),
					})}
				/>
				<p
					className={`text-xs ${
						descriptionOverLimit
							? 'text-destructive'
							: 'text-muted-foreground'
					}`}
				>
					{descriptionWordCount}/{MAX_SUBTITLE_WORDS} palabras
					{descriptionOverLimit &&
						' — supera el máximo recomendado'}
				</p>
			</div>

			<div className="rounded-lg border bg-background p-3">
				<div className="mb-2 flex items-center gap-2">
					<Palette className="h-4 w-4 text-muted-foreground" />
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Vista previa del texto
					</p>
				</div>
				<p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
					{badge || 'BADGE'}
				</p>
				<p className="mt-1 text-lg font-semibold leading-tight">
					{title || 'Título principal'}
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					{description || 'Descripción del hero...'}
				</p>
			</div>
		</HeroSidebarSection>
	)
}
