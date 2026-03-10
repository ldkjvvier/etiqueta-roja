'use client'

import { Timer } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { HeroSidebarSection } from './HeroSidebarSection'
import { HeroSectionProps } from './section-props'

function ToggleSelect({
	label,
	value,
	onChange,
}: {
	label: string
	value: boolean
	onChange: (value: boolean) => void
}) {
	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			<Select
				value={value ? 'true' : 'false'}
				onValueChange={(nextValue) => onChange(nextValue === 'true')}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="true">Sí</SelectItem>
					<SelectItem value="false">No</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}

export function HeroSectionDropCampaign({
	form,
	setField,
	dropOptions,
}: HeroSectionProps) {
	const dropDisplayMode = form.watch('dropDisplayMode')
	const dropTextAlignment = form.watch('dropTextAlignment')
	const dropDateFormat = form.watch('dropDateFormat')

	return (
		<HeroSidebarSection
			title="Drop Campaign"
			description="Countdown, mensajes dinámicos y badges"
			icon={<Timer className="h-4 w-4" />}
		>
			<div className="space-y-2">
				<Label>Drop enlazado</Label>
				<Select
					value={form.watch('linkedDropId') || '__none__'}
					onValueChange={(value) => {
						const normalized = value === '__none__' ? '' : value
						form.setValue('linkedDropId', normalized)
						setField('dropConfig', 'linkedDropId', normalized)
					}}
				>
					<SelectTrigger>
						<SelectValue placeholder="Sin drop enlazado" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="__none__">Sin drop</SelectItem>
						{dropOptions?.map((drop) => (
							<SelectItem key={drop.id} value={drop.id}>
								{drop.name} ({drop.status})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div className="space-y-2">
					<Label>Modo de presentación</Label>
					<Select
						value={dropDisplayMode}
						onValueChange={(value) => {
							form.setValue('dropDisplayMode', value as any)
							setField('dropConfig', 'dropDisplayMode', value)
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="auto">Auto</SelectItem>
							<SelectItem value="message-only">
								Solo mensaje
							</SelectItem>
							<SelectItem value="countdown-only">
								Solo countdown
							</SelectItem>
							<SelectItem value="badge-only">Solo badge</SelectItem>
							<SelectItem value="hidden">Oculto</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Alineación del bloque</Label>
					<Select
						value={dropTextAlignment}
						onValueChange={(value) => {
							form.setValue('dropTextAlignment', value as any)
							setField('dropConfig', 'dropTextAlignment', value)
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="left">Izquierda</SelectItem>
							<SelectItem value="center">Centro</SelectItem>
							<SelectItem value="right">Derecha</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Formato fecha en mensajes</Label>
				<Select
					value={dropDateFormat}
					onValueChange={(value) => {
						form.setValue('dropDateFormat', value as any)
						setField('dropConfig', 'dropDateFormat', value)
					}}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="short">Corto</SelectItem>
						<SelectItem value="long">Largo</SelectItem>
						<SelectItem value="full">Completo</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<ToggleSelect
					label="Mostrar CTA en scheduled"
					value={form.watch('dropShowCtaScheduled')}
					onChange={(value) => {
						form.setValue('dropShowCtaScheduled', value)
						setField('dropConfig', 'dropShowCtaScheduled', value)
					}}
				/>
				<ToggleSelect
					label="Mostrar CTA en live"
					value={form.watch('dropShowCtaLive')}
					onChange={(value) => {
						form.setValue('dropShowCtaLive', value)
						setField('dropConfig', 'dropShowCtaLive', value)
					}}
				/>
				<ToggleSelect
					label="Mostrar CTA en ended"
					value={form.watch('dropShowCtaEnded')}
					onChange={(value) => {
						form.setValue('dropShowCtaEnded', value)
						setField('dropConfig', 'dropShowCtaEnded', value)
					}}
				/>
				<ToggleSelect
					label="Mostrar countdown"
					value={form.watch('dropShowCountdown')}
					onChange={(value) => {
						form.setValue('dropShowCountdown', value)
						setField('dropConfig', 'dropShowCountdown', value)
					}}
				/>
				<ToggleSelect
					label="Mostrar badge live"
					value={form.watch('dropShowLiveBadge')}
					onChange={(value) => {
						form.setValue('dropShowLiveBadge', value)
						setField('dropConfig', 'dropShowLiveBadge', value)
					}}
				/>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="drop_live_badge_text">
						Badge live (texto)
					</Label>
					<Input
						id="drop_live_badge_text"
						{...form.register('dropLiveBadgeText', {
							onChange: (event) =>
								setField(
									'dropConfig',
									'dropLiveBadgeText',
									event.target.value,
								),
						})}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="drop_ended_text">
						Texto cuando termina
					</Label>
					<Input
						id="drop_ended_text"
						{...form.register('dropEndedText', {
							onChange: (event) =>
								setField(
									'dropConfig',
									'dropEndedText',
									event.target.value,
								),
						})}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="drop_message_template_scheduled">
						Mensaje scheduled
					</Label>
					<Textarea
						id="drop_message_template_scheduled"
						className="min-h-16"
						{...form.register('dropMessageTemplateScheduled', {
							onChange: (event) =>
								setField(
									'dropConfig',
									'dropMessageTemplateScheduled',
									event.target.value,
								),
						})}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="drop_message_template_live">
						Mensaje live
					</Label>
					<Textarea
						id="drop_message_template_live"
						className="min-h-16"
						{...form.register('dropMessageTemplateLive', {
							onChange: (event) =>
								setField(
									'dropConfig',
									'dropMessageTemplateLive',
									event.target.value,
								),
						})}
					/>
				</div>
			</div>
			<div className="space-y-2">
				<Label htmlFor="drop_message_template_ended">
					Mensaje ended
				</Label>
				<Textarea
					id="drop_message_template_ended"
					className="min-h-16"
					{...form.register('dropMessageTemplateEnded', {
						onChange: (event) =>
							setField(
								'dropConfig',
								'dropMessageTemplateEnded',
								event.target.value,
							),
					})}
				/>
			</div>
		</HeroSidebarSection>
	)
}
