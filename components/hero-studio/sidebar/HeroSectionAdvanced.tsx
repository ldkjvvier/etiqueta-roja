'use client'

import { Settings2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'

export function HeroSectionAdvanced({
	form,
	setTopLevel,
}: HeroSectionProps) {
	return (
		<HeroSidebarSection
			title="Advanced"
			description="Notas internas y parámetros extendidos"
			icon={<Settings2 className="h-4 w-4" />}
			defaultOpen={false}
		>
			<div className="space-y-2">
				<Label htmlFor="internal_description">
					Descripción interna
				</Label>
				<Input
					id="internal_description"
					{...form.register('internalDescription', {
						onChange: (event) =>
							setTopLevel('internalDescription', event.target.value),
					})}
					placeholder="Notas internas del bloque hero"
				/>
			</div>
			<p className="text-xs text-muted-foreground">
				Sugerido para próximos sprints: reglas condicionales por
				campaña, A/B testing y programación por fechas.
			</p>
		</HeroSidebarSection>
	)
}
