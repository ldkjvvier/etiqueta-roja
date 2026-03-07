'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { HeroDropOption, HeroStudioState } from '@/types/heroStudio.types'

type Dispatch = React.Dispatch<
	| {
			type: 'setField'
			section:
				| 'content'
				| 'media'
				| 'cta'
				| 'layout'
				| 'styles'
				| 'dropConfig'
			key: string
			value: string | number | boolean
	  }
	| {
			type: 'setTopLevel'
			key: 'isActive' | 'internalDescription'
			value: string | boolean
	  }
>

interface HeroControlsSidebarProps {
	state: HeroStudioState
	dispatch: Dispatch
	dropOptions?: HeroDropOption[]
}

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
				<span className="text-xs font-mono text-muted-foreground">{value}</span>
			</div>
		</div>
	)
}

export function HeroControlsSidebar({
	state,
	dispatch,
	dropOptions,
}: HeroControlsSidebarProps) {
	return (
		<aside className="col-span-12 overflow-auto rounded-lg border bg-card p-4 lg:col-span-4">
			<div className="space-y-6">
				<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
					<div className="flex items-center space-x-2">
						<Switch
							id="home_hero_is_active"
							checked={state.isActive}
							onCheckedChange={(checked) =>
								dispatch({ type: 'setTopLevel', key: 'isActive', value: checked })
							}
						/>
						<Label htmlFor="home_hero_is_active">Banner activo</Label>
					</div>

					<div className="space-y-2">
						<Label htmlFor="badge">Pre-título (Badge)</Label>
						<Input
							id="badge"
							value={state.content.badge}
							onChange={(event) =>
								dispatch({ type: 'setField', section: 'content', key: 'badge', value: event.target.value })
							}
							placeholder="DROP EXCLUSIVO — EDICIÓN LIMITADA"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="title">Título Principal</Label>
						<Input
							id="title"
							value={state.content.title}
							onChange={(event) =>
								dispatch({ type: 'setField', section: 'content', key: 'title', value: event.target.value })
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Descripción</Label>
						<Textarea
							id="description"
							value={state.content.description}
							onChange={(event) =>
								dispatch({ type: 'setField', section: 'content', key: 'description', value: event.target.value })
							}
							className="min-h-20"
						/>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="cta_text">Botón (texto)</Label>
							<Input
								id="cta_text"
								value={state.cta.text}
								onChange={(event) =>
									dispatch({ type: 'setField', section: 'cta', key: 'text', value: event.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="cta_link">Botón (enlace)</Label>
							<Input
								id="cta_link"
								value={state.cta.link}
								onChange={(event) =>
									dispatch({ type: 'setField', section: 'cta', key: 'link', value: event.target.value })
								}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="background_image">Imagen de Fondo (URL)</Label>
						<Input
							id="background_image"
							value={state.media.backgroundImage}
							onChange={(event) =>
								dispatch({ type: 'setField', section: 'media', key: 'backgroundImage', value: event.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="background_image_mobile">Imagen Mobile (URL)</Label>
						<Input
							id="background_image_mobile"
							value={state.media.backgroundImageMobile}
							onChange={(event) =>
								dispatch({ type: 'setField', section: 'media', key: 'backgroundImageMobile', value: event.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="background_video_url">Video de Fondo Externo (URL)</Label>
						<Input
							id="background_video_url"
							value={state.media.backgroundVideoUrl}
							onChange={(event) =>
								dispatch({ type: 'setField', section: 'media', key: 'backgroundVideoUrl', value: event.target.value })
							}
							placeholder="https://player.vimeo.com/... o https://.../video.mp4"
						/>
					</div>

					<div className="space-y-2">
						<Label>Drop enlazado</Label>
						<Select
							value={state.dropConfig.linkedDropId || '__none__'}
							onValueChange={(value) =>
								dispatch({
									type: 'setField',
									section: 'dropConfig',
									key: 'linkedDropId',
									value: value === '__none__' ? '' : value,
								})
							}
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
				</section>

				<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
					<h3 className="text-sm font-semibold tracking-wide">Drop Experience Pro</h3>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Modo de presentación</Label>
							<Select
								value={state.dropConfig.dropDisplayMode}
								onValueChange={(value) =>
									dispatch({ type: 'setField', section: 'dropConfig', key: 'dropDisplayMode', value })
								}
							>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="auto">Auto</SelectItem>
									<SelectItem value="message-only">Solo mensaje</SelectItem>
									<SelectItem value="countdown-only">Solo countdown</SelectItem>
									<SelectItem value="badge-only">Solo badge</SelectItem>
									<SelectItem value="hidden">Ocultar bloque drop</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Alineación bloque drop</Label>
							<Select
								value={state.dropConfig.dropTextAlignment}
								onValueChange={(value) =>
									dispatch({ type: 'setField', section: 'dropConfig', key: 'dropTextAlignment', value })
								}
							>
								<SelectTrigger><SelectValue /></SelectTrigger>
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
							value={state.dropConfig.dropDateFormat}
							onValueChange={(value) =>
								dispatch({ type: 'setField', section: 'dropConfig', key: 'dropDateFormat', value })
							}
						>
							<SelectTrigger><SelectValue /></SelectTrigger>
							<SelectContent>
								<SelectItem value="short">Corto</SelectItem>
								<SelectItem value="long">Largo</SelectItem>
								<SelectItem value="full">Completo</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="drop_message_template_scheduled">Mensaje scheduled</Label>
							<Textarea
								id="drop_message_template_scheduled"
								value={state.dropConfig.dropMessageTemplateScheduled}
								onChange={(event) =>
									dispatch({ type: 'setField', section: 'dropConfig', key: 'dropMessageTemplateScheduled', value: event.target.value })
								}
								className="min-h-16"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="drop_message_template_live">Mensaje live</Label>
							<Textarea
								id="drop_message_template_live"
								value={state.dropConfig.dropMessageTemplateLive}
								onChange={(event) =>
									dispatch({ type: 'setField', section: 'dropConfig', key: 'dropMessageTemplateLive', value: event.target.value })
								}
								className="min-h-16"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="drop_message_template_ended">Mensaje ended</Label>
						<Textarea
							id="drop_message_template_ended"
							value={state.dropConfig.dropMessageTemplateEnded}
							onChange={(event) =>
								dispatch({ type: 'setField', section: 'dropConfig', key: 'dropMessageTemplateEnded', value: event.target.value })
							}
							className="min-h-16"
						/>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						{[
							['dropShowCtaScheduled', 'Mostrar CTA en scheduled'],
							['dropShowCtaLive', 'Mostrar CTA en live'],
							['dropShowCtaEnded', 'Mostrar CTA en ended'],
							['dropShowCountdown', 'Mostrar countdown'],
							['dropShowLiveBadge', 'Mostrar badge live'],
						].map(([key, label]) => (
							<div key={key} className="space-y-2">
								<Label>{label}</Label>
								<Select
									value={state.dropConfig[key as keyof HeroStudioState['dropConfig']] ? 'true' : 'false'}
									onValueChange={(value) =>
										dispatch({
											type: 'setField',
											section: 'dropConfig',
											key,
											value: value === 'true',
										})
									}
								>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="true">Sí</SelectItem>
										<SelectItem value="false">No</SelectItem>
									</SelectContent>
								</Select>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="drop_live_badge_text">Badge LIVE (texto)</Label>
							<Input
								id="drop_live_badge_text"
								value={state.dropConfig.dropLiveBadgeText}
								onChange={(event) =>
									dispatch({ type: 'setField', section: 'dropConfig', key: 'dropLiveBadgeText', value: event.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="drop_ended_text">CTA cuando termina</Label>
							<Input
								id="drop_ended_text"
								value={state.dropConfig.dropEndedText}
								onChange={(event) =>
									dispatch({ type: 'setField', section: 'dropConfig', key: 'dropEndedText', value: event.target.value })
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<ColorField label="Countdown (fondo)" id="drop_countdown_bg_color" value={state.dropConfig.dropCountdownBgColor} onChange={(value) => dispatch({ type: 'setField', section: 'dropConfig', key: 'dropCountdownBgColor', value })} />
						<ColorField label="Countdown (texto)" id="drop_countdown_text_color" value={state.dropConfig.dropCountdownTextColor} onChange={(value) => dispatch({ type: 'setField', section: 'dropConfig', key: 'dropCountdownTextColor', value })} />
						<ColorField label="LIVE badge (fondo)" id="drop_live_badge_bg_color" value={state.dropConfig.dropLiveBadgeBgColor} onChange={(value) => dispatch({ type: 'setField', section: 'dropConfig', key: 'dropLiveBadgeBgColor', value })} />
						<ColorField label="LIVE badge (texto)" id="drop_live_badge_text_color" value={state.dropConfig.dropLiveBadgeTextColor} onChange={(value) => dispatch({ type: 'setField', section: 'dropConfig', key: 'dropLiveBadgeTextColor', value })} />
					</div>
				</section>

				<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
					<h3 className="text-sm font-semibold tracking-wide">Estilos y Branding</h3>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<ColorField label="Color del Texto Principal" id="title_color" value={state.styles.titleColor} onChange={(value) => dispatch({ type: 'setField', section: 'styles', key: 'titleColor', value })} />
						<ColorField label="Color del Badge" id="badge_color" value={state.styles.badgeColor} onChange={(value) => dispatch({ type: 'setField', section: 'styles', key: 'badgeColor', value })} />
						<ColorField label="Color Botón (fondo)" id="button_bg_color" value={state.styles.buttonBgColor} onChange={(value) => dispatch({ type: 'setField', section: 'styles', key: 'buttonBgColor', value })} />
						<ColorField label="Color Botón (texto)" id="button_text_color" value={state.styles.buttonTextColor} onChange={(value) => dispatch({ type: 'setField', section: 'styles', key: 'buttonTextColor', value })} />
						<ColorField label="Color de Descripción" id="description_color" value={state.styles.descriptionColor} onChange={(value) => dispatch({ type: 'setField', section: 'styles', key: 'descriptionColor', value })} />
					</div>
					<div className="space-y-2">
						<Label>Peso visual del título</Label>
						<Select
							value={state.styles.titleFontWeight}
							onValueChange={(value) =>
								dispatch({ type: 'setField', section: 'styles', key: 'titleFontWeight', value })
							}
						>
							<SelectTrigger><SelectValue /></SelectTrigger>
							<SelectContent>
								<SelectItem value="bold">Bold</SelectItem>
								<SelectItem value="black">Black</SelectItem>
								<SelectItem value="outline">Outline</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="overlay_opacity">Overlay de Fondo ({state.styles.overlayOpacity}%)</Label>
						<Input
							id="overlay_opacity"
							type="range"
							min={0}
							max={100}
							value={state.styles.overlayOpacity}
							onChange={(event) =>
								dispatch({ type: 'setField', section: 'styles', key: 'overlayOpacity', value: Number(event.target.value) })
							}
						/>
					</div>
				</section>

				<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
					<h3 className="text-sm font-semibold tracking-wide">Layout y Meta</h3>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Alineación del contenido</Label>
							<Select
								value={state.layout.contentAlignment}
								onValueChange={(value) =>
									dispatch({ type: 'setField', section: 'layout', key: 'contentAlignment', value })
								}
							>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="left">Izquierda</SelectItem>
									<SelectItem value="center">Centro</SelectItem>
									<SelectItem value="right">Derecha</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Altura del banner</Label>
							<Select
								value={state.layout.bannerHeight}
								onValueChange={(value) =>
									dispatch({ type: 'setField', section: 'layout', key: 'bannerHeight', value })
								}
							>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="normal">Normal (50vh)</SelectItem>
									<SelectItem value="large">Grande (75vh)</SelectItem>
									<SelectItem value="fullscreen">Pantalla Completa</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="internal_description">Descripción interna</Label>
						<Input
							id="internal_description"
							value={state.internalDescription}
							onChange={(event) =>
								dispatch({
									type: 'setTopLevel',
									key: 'internalDescription',
									value: event.target.value,
								})
							}
							placeholder="Notas internas del bloque hero"
						/>
					</div>
				</section>
			</div>
		</aside>
	)
}
