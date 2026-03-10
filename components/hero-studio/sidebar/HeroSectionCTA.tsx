'use client'

import { MousePointerClick, Pill } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'
import { HeroCTA } from '../HeroCTA'

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

export function HeroSectionCTA({ form, setField }: HeroSectionProps) {
	const ctaText = form.watch('ctaText')
	const ctaLink = form.watch('ctaLink')
	const ctaOpenInNewTab = form.watch('ctaOpenInNewTab')
	const ctaVariant = form.watch('ctaVariant')
	const ctaSize = form.watch('ctaSize')
	const ctaRadius = form.watch('ctaRadius')
	const ctaHoverEffect = form.watch('ctaHoverEffect')
	const ctaAlignment = form.watch('ctaAlignment')
	const ctaFullWidth = form.watch('ctaFullWidth')
	const ctaBackgroundColor = form.watch('ctaBackgroundColor')
	const ctaTextColor = form.watch('ctaTextColor')
	const ctaBorderColor = form.watch('ctaBorderColor')
	const ctaHoverBackgroundColor = form.watch(
		'ctaHoverBackgroundColor',
	)
	const ctaHoverTextColor = form.watch('ctaHoverTextColor')

	return (
		<HeroSidebarSection
			title="CTA"
			description="Mensaje y llamada a la acción"
			icon={<MousePointerClick className="h-4 w-4" />}
		>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="cta_content_text">Texto del botón</Label>
					<Input
						id="cta_content_text"
						{...form.register('ctaText', {
							onChange: (event) =>
								setField('cta', 'text', event.target.value),
						})}
						placeholder="VER COLECCIÓN"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="cta_content_link">Enlace destino</Label>
					<Input
						id="cta_content_link"
						{...form.register('ctaLink', {
							onChange: (event) =>
								setField('cta', 'link', event.target.value),
						})}
						placeholder="/producto/mi-producto"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<div className="space-y-2">
					<Label>Variante</Label>
					<Select
						value={ctaVariant}
						onValueChange={(value) => {
							form.setValue('ctaVariant', value as typeof ctaVariant)
							setField('cta', 'variant', value)
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="solid">Solid</SelectItem>
							<SelectItem value="outline">Outline</SelectItem>
							<SelectItem value="ghost">Ghost</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Tamaño</Label>
					<Select
						value={ctaSize}
						onValueChange={(value) => {
							form.setValue('ctaSize', value as typeof ctaSize)
							setField('cta', 'size', value)
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="sm">Small</SelectItem>
							<SelectItem value="md">Medium</SelectItem>
							<SelectItem value="lg">Large</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Radio</Label>
					<Select
						value={ctaRadius}
						onValueChange={(value) => {
							form.setValue('ctaRadius', value as typeof ctaRadius)
							setField('cta', 'radius', value)
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							<SelectItem value="sm">Small</SelectItem>
							<SelectItem value="md">Medium</SelectItem>
							<SelectItem value="lg">Large</SelectItem>
							<SelectItem value="full">Full</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<div className="space-y-2">
					<Label>Hover</Label>
					<Select
						value={ctaHoverEffect}
						onValueChange={(value) => {
							form.setValue(
								'ctaHoverEffect',
								value as typeof ctaHoverEffect,
							)
							setField('cta', 'hoverEffect', value)
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							<SelectItem value="lift">Lift</SelectItem>
							<SelectItem value="scale">Scale</SelectItem>
							<SelectItem value="invert">Invert</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Alineación</Label>
					<Select
						value={ctaAlignment}
						onValueChange={(value) => {
							form.setValue(
								'ctaAlignment',
								value as typeof ctaAlignment,
							)
							setField('cta', 'alignment', value)
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="left">Left</SelectItem>
							<SelectItem value="center">Center</SelectItem>
							<SelectItem value="right">Right</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label className="block">Opciones</Label>
					<div className="rounded-md border bg-background p-3 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm">Abrir en nueva pestaña</span>
							<Switch
								checked={ctaOpenInNewTab}
								onCheckedChange={(checked) => {
									form.setValue('ctaOpenInNewTab', checked)
									setField('cta', 'openInNewTab', checked)
								}}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Ancho completo</span>
							<Switch
								checked={ctaFullWidth}
								onCheckedChange={(checked) => {
									form.setValue('ctaFullWidth', checked)
									setField('cta', 'fullWidth', checked)
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Pill className="h-4 w-4 text-muted-foreground" />
					<Label>Estilo visual del botón</Label>
				</div>
				<div className="grid grid-cols-3 gap-2">
					{['Solid', 'Outline', 'Ghost'].map((variantLabel) => (
						<Button
							key={variantLabel}
							type="button"
							variant={
								(variantLabel.toLowerCase() === ctaVariant
									? 'default'
									: 'outline') as 'default' | 'outline'
							}
							size="sm"
							className="justify-center"
							onClick={() => {
								const next =
									variantLabel.toLowerCase() as typeof ctaVariant
								form.setValue('ctaVariant', next)
								setField('cta', 'variant', next)
							}}
						>
							{variantLabel}
						</Button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<ColorField
					label="Fondo"
					id="cta_bg_color"
					value={ctaBackgroundColor}
					onChange={(value) => {
						form.setValue('ctaBackgroundColor', value)
						setField('cta', 'backgroundColor', value)
					}}
				/>
				<ColorField
					label="Texto"
					id="cta_text_color"
					value={ctaTextColor}
					onChange={(value) => {
						form.setValue('ctaTextColor', value)
						setField('cta', 'textColor', value)
					}}
				/>
				<ColorField
					label="Borde"
					id="cta_border_color"
					value={ctaBorderColor}
					onChange={(value) => {
						form.setValue('ctaBorderColor', value)
						setField('cta', 'borderColor', value)
					}}
				/>
				<ColorField
					label="Hover fondo"
					id="cta_hover_bg_color"
					value={ctaHoverBackgroundColor}
					onChange={(value) => {
						form.setValue('ctaHoverBackgroundColor', value)
						setField('cta', 'hoverBackgroundColor', value)
					}}
				/>
				<ColorField
					label="Hover texto"
					id="cta_hover_text_color"
					value={ctaHoverTextColor}
					onChange={(value) => {
						form.setValue('ctaHoverTextColor', value)
						setField('cta', 'hoverTextColor', value)
					}}
				/>
			</div>

			<div className="rounded-lg border bg-background p-4">
				<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Preview CTA
				</p>
				<HeroCTA
					config={{
						text: ctaText,
						link: ctaLink,
						openInNewTab: ctaOpenInNewTab,
						variant: ctaVariant,
						size: ctaSize,
						radius: ctaRadius,
						hoverEffect: ctaHoverEffect,
						alignment: ctaAlignment,
						fullWidth: ctaFullWidth,
						backgroundColor: ctaBackgroundColor,
						textColor: ctaTextColor,
						borderColor: ctaBorderColor,
						hoverBackgroundColor: ctaHoverBackgroundColor,
						hoverTextColor: ctaHoverTextColor,
					}}
					text={ctaText || 'VER COLECCIÓN'}
					href={ctaLink || undefined}
					forceButton
				/>
				<p className="mt-2 text-xs text-muted-foreground">
					Destino: {ctaLink || 'sin enlace'}
					{ctaOpenInNewTab ? ' · nueva pestaña' : ''}
				</p>
			</div>
		</HeroSidebarSection>
	)
}
