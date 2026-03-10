'use client'

import { Paintbrush, Type } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'

function ColorField({
	label,
	id,
	value,
	onChange,
}: {
	label: string
	id: string
	value: string
	onChange: (value: string) => void
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
				<Input
					id={id}
					type="color"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className="h-9 w-12 cursor-pointer border-0 p-0"
				/>
				<span className="text-xs font-mono text-muted-foreground">
					{value}
				</span>
			</div>
		</div>
	)
}

export function HeroSectionStyles({
	form,
	setField,
}: HeroSectionProps) {
	const titleFontWeight = form.watch('titleFontWeight')
	const overlayOpacity = form.watch('overlayOpacity')

	return (
		<HeroSidebarSection
			title="Styles"
			description="Tipografía, color y contraste"
			icon={<Paintbrush className="h-4 w-4" />}
		>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<ColorField
					label="Color título"
					id="title_color"
					value={form.watch('titleColor')}
					onChange={(value) => {
						form.setValue('titleColor', value)
						setField('styles', 'titleColor', value)
					}}
				/>
				<ColorField
					label="Color descripción"
					id="description_color"
					value={form.watch('descriptionColor')}
					onChange={(value) => {
						form.setValue('descriptionColor', value)
						setField('styles', 'descriptionColor', value)
					}}
				/>
				<ColorField
					label="Color badge"
					id="badge_color"
					value={form.watch('badgeColor')}
					onChange={(value) => {
						form.setValue('badgeColor', value)
						setField('styles', 'badgeColor', value)
					}}
				/>
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Type className="h-4 w-4 text-muted-foreground" />
					<Label>Peso de título</Label>
				</div>
				<Select
					value={titleFontWeight}
					onValueChange={(value) => {
						form.setValue(
							'titleFontWeight',
							value as 'bold' | 'black' | 'outline',
						)
						setField('styles', 'titleFontWeight', value)
					}}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="bold">Bold</SelectItem>
						<SelectItem value="black">Black</SelectItem>
						<SelectItem value="outline">Outline</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="overlay_opacity">
					Overlay ({overlayOpacity}%)
				</Label>
				<Input
					id="overlay_opacity"
					type="range"
					min={0}
					max={100}
					value={overlayOpacity}
					onChange={(event) => {
						const value = Number(event.target.value)
						form.setValue('overlayOpacity', value)
						setField('styles', 'overlayOpacity', value)
					}}
				/>
			</div>
		</HeroSidebarSection>
	)
}
