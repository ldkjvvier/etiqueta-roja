'use client'

import { useActionState, useEffect, useState } from 'react'
import {
	updatePromoBanner,
	updateContactInfo,
	updateHomeHeroBanner,
} from '@/lib/actions/site-config'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	PromoBannerConfig,
	ContactInfoConfig,
	HomeHeroBannerConfig,
} from '@/lib/services/site-config-server'

type StudioDropStatus = 'scheduled' | 'live' | 'ended'

type DropOption = {
	id: string
	name: string
	status: StudioDropStatus
	start_time: string
	end_time: string | null
}

const initialState = { message: '', error: false }

export function HomeHeroBannerForm({
	initialData,
	isActive,
	initialDescription,
	dropOptions,
}: {
	initialData?: HomeHeroBannerConfig
	isActive?: boolean
	initialDescription?: string | null
	dropOptions?: DropOption[]
}) {
	const [state, formAction, isPending] = useActionState(
		updateHomeHeroBanner,
		initialState,
	)
	const [isStudioOpen, setIsStudioOpen] = useState(false)
	const [contentAlignment, setContentAlignment] = useState<
		'left' | 'center' | 'right'
	>(initialData?.content_alignment ?? 'left')
	const [bannerHeight, setBannerHeight] = useState<
		'normal' | 'large' | 'fullscreen'
	>(initialData?.banner_height ?? 'normal')
	const [heroActive, setHeroActive] = useState(isActive ?? true)
	const [badge, setBadge] = useState(initialData?.badge ?? '')
	const [title, setTitle] = useState(initialData?.title ?? '')
	const [description, setDescription] = useState(
		initialData?.description ?? '',
	)
	const [ctaText, setCtaText] = useState(initialData?.cta_text ?? '')
	const [ctaLink, setCtaLink] = useState(initialData?.cta_link ?? '')
	const [backgroundImage, setBackgroundImage] = useState(
		initialData?.background_image ?? '',
	)
	const [backgroundImageMobile, setBackgroundImageMobile] = useState(
		initialData?.background_image_mobile ?? '',
	)
	const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(
		initialData?.background_video_url ?? '',
	)
	const [linkedDropId, setLinkedDropId] = useState(
		initialData?.linked_drop_id ?? '',
	)
	const [dropEndedText, setDropEndedText] = useState(
		initialData?.drop_ended_text ?? 'SOLD OUT',
	)
	const [dropLiveBadgeText, setDropLiveBadgeText] = useState(
		initialData?.drop_live_badge_text ?? 'LIVE NOW',
	)
	const [dropCountdownBgColor, setDropCountdownBgColor] = useState(
		initialData?.drop_countdown_bg_color ?? '#0A0A0A',
	)
	const [dropCountdownTextColor, setDropCountdownTextColor] =
		useState(initialData?.drop_countdown_text_color ?? '#FFFFFF')
	const [dropLiveBadgeBgColor, setDropLiveBadgeBgColor] = useState(
		initialData?.drop_live_badge_bg_color ?? '#E62727',
	)
	const [dropLiveBadgeTextColor, setDropLiveBadgeTextColor] =
		useState(initialData?.drop_live_badge_text_color ?? '#FFFFFF')
	const [dropDisplayMode, setDropDisplayMode] = useState<
		| 'auto'
		| 'message-only'
		| 'countdown-only'
		| 'badge-only'
		| 'hidden'
	>(initialData?.drop_display_mode ?? 'auto')
	const [
		dropMessageTemplateScheduled,
		setDropMessageTemplateScheduled,
	] = useState(
		initialData?.drop_message_template_scheduled ??
			'Drop starts on {date_short} at {time_12}',
	)
	const [dropMessageTemplateLive, setDropMessageTemplateLive] =
		useState(
			initialData?.drop_message_template_live ?? 'Drop live now',
		)
	const [dropMessageTemplateEnded, setDropMessageTemplateEnded] =
		useState(
			initialData?.drop_message_template_ended ??
				'Drop finished on {date_short}',
		)
	const [dropTextAlignment, setDropTextAlignment] = useState<
		'left' | 'center' | 'right'
	>(initialData?.drop_text_alignment ?? 'left')
	const [dropDateFormat, setDropDateFormat] = useState<
		'short' | 'long' | 'full'
	>(initialData?.drop_date_format ?? 'long')
	const [dropShowCtaScheduled, setDropShowCtaScheduled] = useState(
		initialData?.drop_show_cta_scheduled ?? false,
	)
	const [dropShowCtaLive, setDropShowCtaLive] = useState(
		initialData?.drop_show_cta_live ?? true,
	)
	const [dropShowCtaEnded, setDropShowCtaEnded] = useState(
		initialData?.drop_show_cta_ended ?? true,
	)
	const [dropShowCountdown, setDropShowCountdown] = useState(
		initialData?.drop_show_countdown ?? true,
	)
	const [dropShowLiveBadge, setDropShowLiveBadge] = useState(
		initialData?.drop_show_live_badge ?? true,
	)
	const [titleColor, setTitleColor] = useState(
		initialData?.title_color ?? '#111111',
	)
	const [descriptionColor, setDescriptionColor] = useState(
		initialData?.description_color ?? '#6B7280',
	)
	const [badgeColor, setBadgeColor] = useState(
		initialData?.badge_color ?? '#E62727',
	)
	const [buttonBgColor, setButtonBgColor] = useState(
		initialData?.button_bg_color ?? '#E62727',
	)
	const [buttonTextColor, setButtonTextColor] = useState(
		initialData?.button_text_color ?? '#FFFFFF',
	)
	const [titleFontWeight, setTitleFontWeight] = useState<
		'bold' | 'black' | 'outline'
	>(initialData?.title_font_weight ?? 'black')
	const [overlayOpacity, setOverlayOpacity] = useState<number>(
		initialData?.overlay_opacity ?? 45,
	)
	const [previewNowMs, setPreviewNowMs] = useState(() => Date.now())

	const previewHeightClass =
		bannerHeight === 'fullscreen'
			? 'min-h-[60vh]'
			: bannerHeight === 'large'
				? 'min-h-[46vh]'
				: 'min-h-[34vh]'

	const previewAlignmentClass =
		contentAlignment === 'center'
			? 'items-center text-center'
			: contentAlignment === 'right'
				? 'items-end text-right'
				: 'items-start text-left'

	const previewTitleWeightClass =
		titleFontWeight === 'bold'
			? 'font-bold'
			: titleFontWeight === 'outline'
				? 'font-black text-transparent [-webkit-text-stroke:1.5px_currentColor]'
				: 'font-black'

	const isValidExternalVideoUrl = (url: string) => {
		if (!url.trim()) {
			return true
		}

		try {
			const parsed = new URL(url)
			return (
				parsed.protocol === 'https:' || parsed.protocol === 'http:'
			)
		} catch {
			return false
		}
	}

	const hasInvalidVideoUrl = !isValidExternalVideoUrl(
		backgroundVideoUrl,
	)

	const selectedDrop = dropOptions?.find(
		(drop) => drop.id === linkedDropId,
	)

	const resolveDropStatusForPreview = (
		drop?: DropOption,
	): StudioDropStatus | null => {
		if (!drop) {
			return null
		}

		const startMs = new Date(drop.start_time).getTime()
		const endMs = drop.end_time
			? new Date(drop.end_time).getTime()
			: null

		if (!Number.isNaN(startMs)) {
			if (previewNowMs < startMs) return 'scheduled'
			if (endMs && !Number.isNaN(endMs) && previewNowMs >= endMs)
				return 'ended'
			return 'live'
		}

		return drop.status
	}

	const previewDropStatus = resolveDropStatusForPreview(selectedDrop)

	const formatPreviewDate = (value: string | null | undefined) => {
		if (!value) return ''
		const date = new Date(value)
		if (Number.isNaN(date.getTime())) return ''

		if (dropDateFormat === 'short') {
			const day = String(date.getDate()).padStart(2, '0')
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const year = String(date.getFullYear())
			return `${day}/${month}/${year}`
		}

		const optionsByMode = {
			long: {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			} as const,
			full: {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			} as const,
		}

		return new Intl.DateTimeFormat(
			'es-CL',
			optionsByMode[dropDateFormat as 'long' | 'full'],
		).format(date)
	}

	const formatPreviewTime = (
		value: string | null | undefined,
		mode: '12' | '24',
	) => {
		if (!value) return ''
		const date = new Date(value)
		if (Number.isNaN(date.getTime())) return ''

		return new Intl.DateTimeFormat('es-CL', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: mode === '12',
		}).format(date)
	}

	const applyTemplate = (
		template: string,
		params: Record<string, string>,
	) =>
		template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
			return params[key] ?? ''
		})

	const getCountdownParts = (targetDate?: string) => {
		if (!targetDate) {
			return null
		}

		const targetMs = new Date(targetDate).getTime()
		if (Number.isNaN(targetMs)) {
			return null
		}

		const diff = Math.max(0, targetMs - previewNowMs)
		const totalSeconds = Math.floor(diff / 1000)
		return {
			days: Math.floor(totalSeconds / 86400),
			hours: Math.floor((totalSeconds % 86400) / 3600),
			minutes: Math.floor((totalSeconds % 3600) / 60),
			seconds: totalSeconds % 60,
		}
	}

	const previewCountdown = getCountdownParts(selectedDrop?.start_time)
	const previewDateLabel = formatPreviewDate(selectedDrop?.start_time)
	const previewTime12Label = formatPreviewTime(
		selectedDrop?.start_time,
		'12',
	)
	const previewTime24Label = formatPreviewTime(
		selectedDrop?.start_time,
		'24',
	)
	const previewEndDateLabel = formatPreviewDate(
		selectedDrop?.end_time,
	)
	const previewEndTime12Label = formatPreviewTime(
		selectedDrop?.end_time,
		'12',
	)
	const previewEndTime24Label = formatPreviewTime(
		selectedDrop?.end_time,
		'24',
	)
	const previewDateShort = selectedDrop?.start_time
		? (() => {
				const d = new Date(selectedDrop.start_time)
				if (Number.isNaN(d.getTime())) return ''
				return `${String(d.getDate()).padStart(2, '0')}/${String(
					d.getMonth() + 1,
				).padStart(2, '0')}/${d.getFullYear()}`
			})()
		: ''
	const previewDateLong = selectedDrop?.start_time
		? new Intl.DateTimeFormat('es-CL', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}).format(new Date(selectedDrop.start_time))
		: ''
	const previewDateFull = selectedDrop?.start_time
		? new Intl.DateTimeFormat('es-CL', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}).format(new Date(selectedDrop.start_time))
		: ''
	const previewMessage =
		previewDropStatus === 'scheduled'
			? applyTemplate(dropMessageTemplateScheduled, {
					status: 'scheduled',
					date: previewDateLabel,
					time: previewTime12Label,
					date_short: previewDateShort,
					date_long: previewDateLong,
					date_full: previewDateFull,
					time_12: previewTime12Label,
					time_24: previewTime24Label,
					end_date: previewEndDateLabel,
					end_time_12: previewEndTime12Label,
					end_time_24: previewEndTime24Label,
					start_iso: selectedDrop?.start_time ?? '',
					end_iso: selectedDrop?.end_time ?? '',
				})
			: previewDropStatus === 'live'
				? applyTemplate(dropMessageTemplateLive, {
						status: 'live',
						date: previewDateLabel,
						time: previewTime12Label,
						date_short: previewDateShort,
						date_long: previewDateLong,
						date_full: previewDateFull,
						time_12: previewTime12Label,
						time_24: previewTime24Label,
						end_date: previewEndDateLabel,
						end_time_12: previewEndTime12Label,
						end_time_24: previewEndTime24Label,
						start_iso: selectedDrop?.start_time ?? '',
						end_iso: selectedDrop?.end_time ?? '',
					})
				: previewDropStatus === 'ended'
					? applyTemplate(dropMessageTemplateEnded, {
							status: 'ended',
							date: previewDateLabel,
							time: previewTime12Label,
							date_short: previewDateShort,
							date_long: previewDateLong,
							date_full: previewDateFull,
							time_12: previewTime12Label,
							time_24: previewTime24Label,
							end_date: previewEndDateLabel,
							end_time_12: previewEndTime12Label,
							end_time_24: previewEndTime24Label,
							start_iso: selectedDrop?.start_time ?? '',
							end_iso: selectedDrop?.end_time ?? '',
						})
					: ''
	const previewCtaText =
		previewDropStatus === 'ended'
			? dropEndedText || 'SOLD OUT'
			: ctaText
	const previewCtaDisabled =
		previewDropStatus === 'scheduled' || previewDropStatus === 'ended'
	const previewDropTextAlignmentClass =
		dropTextAlignment === 'center'
			? 'items-center text-center'
			: dropTextAlignment === 'right'
				? 'items-end text-right'
				: 'items-start text-left'
	const previewShowCountdown =
		dropDisplayMode !== 'hidden' &&
		dropDisplayMode !== 'message-only' &&
		dropDisplayMode !== 'badge-only' &&
		dropShowCountdown &&
		previewDropStatus === 'scheduled'
	const previewShowLiveBadge =
		dropDisplayMode !== 'hidden' &&
		dropDisplayMode !== 'message-only' &&
		dropDisplayMode !== 'countdown-only' &&
		dropShowLiveBadge &&
		previewDropStatus === 'live'
	const previewShowMessage =
		dropDisplayMode === 'message-only' ||
		(dropDisplayMode !== 'hidden' && Boolean(previewMessage))
	const previewShowCta =
		dropDisplayMode !== 'hidden' &&
		previewCtaText &&
		((previewDropStatus === 'scheduled' && dropShowCtaScheduled) ||
			(previewDropStatus === 'live' && dropShowCtaLive) ||
			(previewDropStatus === 'ended' && dropShowCtaEnded) ||
			(!previewDropStatus && true))

	const formatTwoDigits = (value: number) =>
		value.toString().padStart(2, '0')

	useEffect(() => {
		if (!isStudioOpen) {
			return
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsStudioOpen(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isStudioOpen])

	useEffect(() => {
		if (!isStudioOpen) {
			return
		}

		const intervalId = window.setInterval(() => {
			setPreviewNowMs(Date.now())
		}, 1000)

		return () => window.clearInterval(intervalId)
	}, [isStudioOpen])

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Hero Banner Home</CardTitle>
					<CardDescription>
						Controla contenido, branding y layout desde un editor
						full-screen.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border bg-muted/20 p-4">
						<p className="text-sm font-medium">Título actual</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{title || 'Sin título definido'}
						</p>
						<p className="mt-2 text-xs text-muted-foreground">
							Estado: {heroActive ? 'Activo' : 'Inactivo'}
						</p>
					</div>
					<Button type="button" onClick={() => setIsStudioOpen(true)}>
						Abrir Hero Studio
					</Button>
					{state.message && (
						<p
							className={`text-sm ${
								state.error ? 'text-destructive' : 'text-green-600'
							}`}
						>
							{state.message}
						</p>
					)}
				</CardContent>
			</Card>

			{isStudioOpen && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<form action={formAction} className="flex h-full flex-col">
						<input
							type="hidden"
							name="content_alignment"
							value={contentAlignment}
						/>
						<input
							type="hidden"
							name="banner_height"
							value={bannerHeight}
						/>
						<input
							type="hidden"
							name="linked_drop_id"
							value={linkedDropId}
						/>
						<input
							type="hidden"
							name="title_font_weight"
							value={titleFontWeight}
						/>
						<input
							type="hidden"
							name="drop_ended_text"
							value={dropEndedText}
						/>
						<input
							type="hidden"
							name="drop_live_badge_text"
							value={dropLiveBadgeText}
						/>
						<input
							type="hidden"
							name="drop_countdown_bg_color"
							value={dropCountdownBgColor}
						/>
						<input
							type="hidden"
							name="drop_countdown_text_color"
							value={dropCountdownTextColor}
						/>
						<input
							type="hidden"
							name="drop_live_badge_bg_color"
							value={dropLiveBadgeBgColor}
						/>
						<input
							type="hidden"
							name="drop_live_badge_text_color"
							value={dropLiveBadgeTextColor}
						/>
						<input
							type="hidden"
							name="drop_display_mode"
							value={dropDisplayMode}
						/>
						<input
							type="hidden"
							name="drop_message_template_scheduled"
							value={dropMessageTemplateScheduled}
						/>
						<input
							type="hidden"
							name="drop_message_template_live"
							value={dropMessageTemplateLive}
						/>
						<input
							type="hidden"
							name="drop_message_template_ended"
							value={dropMessageTemplateEnded}
						/>
						<input
							type="hidden"
							name="drop_text_alignment"
							value={dropTextAlignment}
						/>
						<input
							type="hidden"
							name="drop_date_format"
							value={dropDateFormat}
						/>
						<input
							type="hidden"
							name="drop_show_cta_scheduled"
							value={String(dropShowCtaScheduled)}
						/>
						<input
							type="hidden"
							name="drop_show_cta_live"
							value={String(dropShowCtaLive)}
						/>
						<input
							type="hidden"
							name="drop_show_cta_ended"
							value={String(dropShowCtaEnded)}
						/>
						<input
							type="hidden"
							name="drop_show_countdown"
							value={String(dropShowCountdown)}
						/>
						<input
							type="hidden"
							name="drop_show_live_badge"
							value={String(dropShowLiveBadge)}
						/>

						<div className="flex items-center justify-between border-b bg-background px-5 py-3">
							<div>
								<p className="text-sm font-semibold">Hero Studio</p>
								<p className="text-xs text-muted-foreground">
									Editor dedicado del banner principal.
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsStudioOpen(false)}
								>
									Cerrar
								</Button>
								<Button
									type="submit"
									disabled={isPending || hasInvalidVideoUrl}
								>
									{isPending ? 'Guardando...' : 'Guardar Hero'}
								</Button>
							</div>
						</div>

						<div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden p-4">
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
											Drop:{' '}
											{selectedDrop?.name ?? 'Sin drop enlazado'}
										</p>
										<p className="text-muted-foreground">
											Preview: {previewDropStatus ?? 'sin estado'}
										</p>
										{selectedDrop?.start_time && (
											<p className="text-muted-foreground">
												Inicio: {previewDateShort}{' '}
												{previewTime12Label}
											</p>
										)}
									</div>

									<div className="rounded-md border bg-muted/20 p-3 text-xs">
										<p className="font-semibold text-foreground">
											Placeholders disponibles
										</p>
										<div className="mt-2 space-y-1 text-muted-foreground">
											<p>
												{'{status}'} → {previewDropStatus ?? '-'}
											</p>
											<p>
												{'{date}'} → {previewDateLabel || '-'}
											</p>
											<p>
												{'{time}'} / {'{time_12}'} →{' '}
												{previewTime12Label || '-'}
											</p>
											<p>
												{'{time_24}'} → {previewTime24Label || '-'}
											</p>
											<p>
												{'{date_short}'} → {previewDateShort || '-'}
											</p>
											<p>
												{'{date_long}'} → {previewDateLong || '-'}
											</p>
											<p>
												{'{date_full}'} → {previewDateFull || '-'}
											</p>
											<p>
												{'{end_date}'} → {previewEndDateLabel || '-'}
											</p>
											<p>
												{'{end_time_12}'} →{' '}
												{previewEndTime12Label || '-'}
											</p>
											<p>
												{'{end_time_24}'} →{' '}
												{previewEndTime24Label || '-'}
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
											- Usa modo "Solo mensaje" para comunicación
											editorial.
										</p>
										<p>- Usa {'{date_short}'} para 04/03/2026.</p>
										<p>
											- Combina {'{date_short}'} + {'{time_12}'} para
											textos claros.
										</p>
									</div>
								</div>
							</aside>

							<main className="col-span-12 overflow-auto rounded-lg border bg-card p-4 lg:col-span-6">
								<div className="mb-3 flex items-center justify-between">
									<p className="text-sm font-semibold">
										Canvas Preview
									</p>
									<p className="text-xs text-muted-foreground">
										Simulación de Home
									</p>
								</div>
								<div className="rounded-xl border bg-secondary p-3">
									<div className="relative overflow-hidden rounded-lg border bg-secondary">
										{backgroundVideoUrl ? (
											<video
												className="absolute inset-0 h-full w-full object-cover"
												autoPlay
												loop
												muted
												playsInline
												preload="metadata"
											>
												<source src={backgroundVideoUrl} />
											</video>
										) : backgroundImage ? (
											<>
												<img
													src={backgroundImage}
													alt="Preview hero"
													className="absolute inset-0 h-full w-full object-cover"
												/>
											</>
										) : null}
										<div
											className="absolute inset-0 bg-black"
											style={{ opacity: overlayOpacity / 100 }}
										/>

										<div
											className={`relative flex ${previewHeightClass} flex-col justify-center p-6 md:p-8`}
										>
											<div
												className={`flex w-full flex-col ${previewAlignmentClass}`}
											>
												<div className="max-w-xl">
													{badge && (
														<p
															className="mb-3 text-xs font-bold tracking-widest"
															style={{ color: badgeColor }}
														>
															{badge}
														</p>
													)}
													<h4
														className={`mb-4 text-3xl leading-none tracking-tight md:text-5xl ${previewTitleWeightClass}`}
														style={{ color: titleColor }}
													>
														{title || 'Título principal del Hero'}
													</h4>
													{description && (
														<p
															className="mb-6 max-w-lg text-sm md:text-base"
															style={{ color: descriptionColor }}
														>
															{description}
														</p>
													)}

													<div
														className={`mb-2 flex flex-col ${previewDropTextAlignmentClass}`}
													>
														{previewShowMessage && previewMessage && (
															<p className="mb-3 text-sm font-semibold tracking-wide text-white/90">
																{previewMessage}
															</p>
														)}

														{previewShowCountdown &&
															previewCountdown && (
																<div
																	className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/15 p-2"
																	style={{
																		backgroundColor:
																			dropCountdownBgColor,
																	}}
																>
																	{(
																		[
																			{
																				label: 'DD',
																				value: previewCountdown.days,
																			},
																			{
																				label: 'HH',
																				value: previewCountdown.hours,
																			},
																			{
																				label: 'MM',
																				value:
																					previewCountdown.minutes,
																			},
																			{
																				label: 'SS',
																				value:
																					previewCountdown.seconds,
																			},
																		] as const
																	).map((item) => (
																		<div
																			key={item.label}
																			className="min-w-10 rounded border border-white/20 bg-black/35 px-2 py-1 text-center"
																		>
																			<p
																				className="font-mono text-sm font-black"
																				style={{
																					color:
																						dropCountdownTextColor,
																				}}
																			>
																				{formatTwoDigits(item.value)}
																			</p>
																			<p
																				className="text-[10px] font-semibold tracking-wider"
																				style={{
																					color:
																						dropCountdownTextColor,
																				}}
																			>
																				{item.label}
																			</p>
																		</div>
																	))}
																</div>
															)}

														{previewShowLiveBadge &&
															dropLiveBadgeText && (
																<span
																	className="mb-3 inline-flex w-fit rounded-md px-3 py-1 text-xs font-bold tracking-wider"
																	style={{
																		backgroundColor:
																			dropLiveBadgeBgColor,
																		color: dropLiveBadgeTextColor,
																	}}
																>
																	{dropLiveBadgeText}
																</span>
															)}
													</div>

													{previewShowCta && previewCtaText && (
														<span
															className={`inline-flex w-fit rounded-md px-5 py-2.5 text-sm font-bold ${previewCtaDisabled ? 'cursor-not-allowed opacity-80' : ''}`}
															style={{
																backgroundColor: buttonBgColor,
																color: buttonTextColor,
															}}
														>
															{previewCtaText}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="mt-3 space-y-1 text-xs text-muted-foreground">
									{!heroActive && (
										<p>
											El banner está desactivado y no se mostrará en
											la home.
										</p>
									)}
									{linkedDropId && (
										<p>Drop enlazado: {linkedDropId}</p>
									)}
									{previewDropStatus && (
										<p>Estado preview drop: {previewDropStatus}</p>
									)}
									{dropDisplayMode && (
										<p>Modo drop: {dropDisplayMode}</p>
									)}
									{ctaLink && <p>Destino CTA: {ctaLink}</p>}
									{backgroundImageMobile && (
										<p>Imagen mobile configurada</p>
									)}
									{backgroundVideoUrl && <p>Video de fondo activo</p>}
								</div>
							</main>

							<aside className="col-span-12 overflow-auto rounded-lg border bg-card p-4 lg:col-span-4">
								<div className="space-y-6">
									<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
										<div className="flex items-center space-x-2">
											<Switch
												id="home_hero_is_active"
												name="is_active"
												checked={heroActive}
												onCheckedChange={setHeroActive}
											/>
											<Label htmlFor="home_hero_is_active">
												Banner activo
											</Label>
										</div>
										<div className="space-y-2">
											<Label htmlFor="badge">
												Pre-título (Badge)
											</Label>
											<Input
												id="badge"
												name="badge"
												value={badge}
												onChange={(event) =>
													setBadge(event.target.value)
												}
												placeholder="DROP EXCLUSIVO — EDICIÓN LIMITADA"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="title">Título Principal</Label>
											<Input
												id="title"
												name="title"
												value={title}
												onChange={(event) =>
													setTitle(event.target.value)
												}
												placeholder="LA CALLE ES NUESTRA"
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="description">Descripción</Label>
											<Textarea
												id="description"
												name="description"
												value={description}
												onChange={(event) =>
													setDescription(event.target.value)
												}
												placeholder="Piezas únicas que definen el estilo urbano..."
												className="min-h-20"
											/>
										</div>
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor="cta_text">
													Botón (texto)
												</Label>
												<Input
													id="cta_text"
													name="cta_text"
													value={ctaText}
													onChange={(event) =>
														setCtaText(event.target.value)
													}
													placeholder="VER COLECCIÓN"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="cta_link">
													Botón (enlace)
												</Label>
												<Input
													id="cta_link"
													name="cta_link"
													value={ctaLink}
													onChange={(event) =>
														setCtaLink(event.target.value)
													}
													placeholder="/producto/mi-producto"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="background_image">
												Imagen de Fondo (URL)
											</Label>
											<Input
												id="background_image"
												name="background_image"
												value={backgroundImage}
												onChange={(event) =>
													setBackgroundImage(event.target.value)
												}
												placeholder="https://..."
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="background_image_mobile">
												Imagen Mobile (URL)
											</Label>
											<Input
												id="background_image_mobile"
												name="background_image_mobile"
												value={backgroundImageMobile}
												onChange={(event) =>
													setBackgroundImageMobile(event.target.value)
												}
												placeholder="https://..."
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="background_video_url">
												Video de Fondo Externo (URL)
											</Label>
											<Input
												id="background_video_url"
												name="background_video_url"
												value={backgroundVideoUrl}
												onChange={(event) =>
													setBackgroundVideoUrl(event.target.value)
												}
												placeholder="https://player.vimeo.com/... o https://.../video.mp4"
											/>
											{hasInvalidVideoUrl && (
												<p className="text-xs text-destructive">
													La URL debe ser externa y comenzar con
													http:// o https://
												</p>
											)}
										</div>
										<div className="space-y-2">
											<Label>Drop enlazado</Label>
											<Select
												value={linkedDropId || '__none__'}
												onValueChange={(value) =>
													setLinkedDropId(
														value === '__none__' ? '' : value,
													)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Sin drop enlazado" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="__none__">
														Sin drop
													</SelectItem>
													{dropOptions?.map((drop) => (
														<SelectItem key={drop.id} value={drop.id}>
															{drop.name} ({drop.status})
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
											<h3 className="text-sm font-semibold tracking-wide">
												Drop Experience Pro
											</h3>
											<p className="text-xs text-muted-foreground">
												Placeholders: {'{status}'}, {'{date}'},{' '}
												{'{date_short}'}, {'{date_long}'},{' '}
												{'{date_full}'}, {'{time}'}, {'{time_12}'},{' '}
												{'{time_24}'}, {'{end_date}'},{' '}
												{'{end_time_12}'}, {'{end_time_24}'},{' '}
												{'{start_iso}'}, {'{end_iso}'}
											</p>

											<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
												<div className="space-y-2">
													<Label>Modo de presentación</Label>
													<Select
														value={dropDisplayMode}
														onValueChange={(value) =>
															setDropDisplayMode(
																value as
																	| 'auto'
																	| 'message-only'
																	| 'countdown-only'
																	| 'badge-only'
																	| 'hidden',
															)
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Modo" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="auto">
																Auto
															</SelectItem>
															<SelectItem value="message-only">
																Solo mensaje
															</SelectItem>
															<SelectItem value="countdown-only">
																Solo countdown
															</SelectItem>
															<SelectItem value="badge-only">
																Solo badge
															</SelectItem>
															<SelectItem value="hidden">
																Ocultar bloque drop
															</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<div className="space-y-2">
													<Label>Alineación del bloque drop</Label>
													<Select
														value={dropTextAlignment}
														onValueChange={(value) =>
															setDropTextAlignment(
																value as 'left' | 'center' | 'right',
															)
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Alineación" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="left">
																Izquierda
															</SelectItem>
															<SelectItem value="center">
																Centro
															</SelectItem>
															<SelectItem value="right">
																Derecha
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>

											<div className="space-y-2">
												<Label>Formato fecha en mensajes</Label>
												<Select
													value={dropDateFormat}
													onValueChange={(value) =>
														setDropDateFormat(
															value as 'short' | 'long' | 'full',
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Formato" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="short">
															Corto
														</SelectItem>
														<SelectItem value="long">
															Largo
														</SelectItem>
														<SelectItem value="full">
															Completo
														</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
												<div className="space-y-2">
													<Label htmlFor="drop_message_template_scheduled">
														Mensaje scheduled
													</Label>
													<Textarea
														id="drop_message_template_scheduled"
														name="drop_message_template_scheduled"
														value={dropMessageTemplateScheduled}
														onChange={(event) =>
															setDropMessageTemplateScheduled(
																event.target.value,
															)
														}
														className="min-h-16"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="drop_message_template_live">
														Mensaje live
													</Label>
													<Textarea
														id="drop_message_template_live"
														name="drop_message_template_live"
														value={dropMessageTemplateLive}
														onChange={(event) =>
															setDropMessageTemplateLive(
																event.target.value,
															)
														}
														className="min-h-16"
													/>
												</div>
											</div>

											<div className="space-y-2">
												<Label htmlFor="drop_message_template_ended">
													Mensaje ended
												</Label>
												<Textarea
													id="drop_message_template_ended"
													name="drop_message_template_ended"
													value={dropMessageTemplateEnded}
													onChange={(event) =>
														setDropMessageTemplateEnded(
															event.target.value,
														)
													}
													className="min-h-16"
												/>
											</div>

											<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
												<div className="space-y-2">
													<Label>Mostrar CTA en scheduled</Label>
													<Select
														value={
															dropShowCtaScheduled ? 'true' : 'false'
														}
														onValueChange={(value) =>
															setDropShowCtaScheduled(
																value === 'true',
															)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="true">Sí</SelectItem>
															<SelectItem value="false">
																No
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<Label>Mostrar CTA en live</Label>
													<Select
														value={dropShowCtaLive ? 'true' : 'false'}
														onValueChange={(value) =>
															setDropShowCtaLive(value === 'true')
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="true">Sí</SelectItem>
															<SelectItem value="false">
																No
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<Label>Mostrar CTA en ended</Label>
													<Select
														value={
															dropShowCtaEnded ? 'true' : 'false'
														}
														onValueChange={(value) =>
															setDropShowCtaEnded(value === 'true')
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="true">Sí</SelectItem>
															<SelectItem value="false">
																No
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<Label>Mostrar countdown</Label>
													<Select
														value={
															dropShowCountdown ? 'true' : 'false'
														}
														onValueChange={(value) =>
															setDropShowCountdown(value === 'true')
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="true">Sí</SelectItem>
															<SelectItem value="false">
																No
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<Label>Mostrar badge live</Label>
													<Select
														value={
															dropShowLiveBadge ? 'true' : 'false'
														}
														onValueChange={(value) =>
															setDropShowLiveBadge(value === 'true')
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="true">Sí</SelectItem>
															<SelectItem value="false">
																No
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
											<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
												<div className="space-y-2">
													<Label htmlFor="drop_live_badge_text">
														Badge LIVE (texto)
													</Label>
													<Input
														id="drop_live_badge_text"
														name="drop_live_badge_text"
														value={dropLiveBadgeText}
														onChange={(event) =>
															setDropLiveBadgeText(event.target.value)
														}
														placeholder="LIVE NOW"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="drop_ended_text">
														CTA cuando termina
													</Label>
													<Input
														id="drop_ended_text"
														name="drop_ended_text"
														value={dropEndedText}
														onChange={(event) =>
															setDropEndedText(event.target.value)
														}
														placeholder="SOLD OUT"
													/>
												</div>
											</div>

											<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
												<div className="space-y-2">
													<Label htmlFor="drop_countdown_bg_color">
														Countdown (fondo)
													</Label>
													<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
														<Input
															id="drop_countdown_bg_color"
															name="drop_countdown_bg_color"
															type="color"
															value={dropCountdownBgColor}
															onChange={(event) =>
																setDropCountdownBgColor(
																	event.target.value,
																)
															}
															className="h-9 w-12 cursor-pointer border-0 p-0"
														/>
														<span className="text-xs font-mono text-muted-foreground">
															{dropCountdownBgColor}
														</span>
													</div>
												</div>
												<div className="space-y-2">
													<Label htmlFor="drop_countdown_text_color">
														Countdown (texto)
													</Label>
													<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
														<Input
															id="drop_countdown_text_color"
															name="drop_countdown_text_color"
															type="color"
															value={dropCountdownTextColor}
															onChange={(event) =>
																setDropCountdownTextColor(
																	event.target.value,
																)
															}
															className="h-9 w-12 cursor-pointer border-0 p-0"
														/>
														<span className="text-xs font-mono text-muted-foreground">
															{dropCountdownTextColor}
														</span>
													</div>
												</div>
												<div className="space-y-2">
													<Label htmlFor="drop_live_badge_bg_color">
														LIVE badge (fondo)
													</Label>
													<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
														<Input
															id="drop_live_badge_bg_color"
															name="drop_live_badge_bg_color"
															type="color"
															value={dropLiveBadgeBgColor}
															onChange={(event) =>
																setDropLiveBadgeBgColor(
																	event.target.value,
																)
															}
															className="h-9 w-12 cursor-pointer border-0 p-0"
														/>
														<span className="text-xs font-mono text-muted-foreground">
															{dropLiveBadgeBgColor}
														</span>
													</div>
												</div>
												<div className="space-y-2">
													<Label htmlFor="drop_live_badge_text_color">
														LIVE badge (texto)
													</Label>
													<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
														<Input
															id="drop_live_badge_text_color"
															name="drop_live_badge_text_color"
															type="color"
															value={dropLiveBadgeTextColor}
															onChange={(event) =>
																setDropLiveBadgeTextColor(
																	event.target.value,
																)
															}
															className="h-9 w-12 cursor-pointer border-0 p-0"
														/>
														<span className="text-xs font-mono text-muted-foreground">
															{dropLiveBadgeTextColor}
														</span>
													</div>
												</div>
											</div>
										</section>
									</section>

									<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
										<h3 className="text-sm font-semibold tracking-wide">
											Estilos y Branding
										</h3>
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor="title_color">
													Color del Texto Principal
												</Label>
												<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
													<Input
														id="title_color"
														name="title_color"
														type="color"
														value={titleColor}
														onChange={(event) =>
															setTitleColor(event.target.value)
														}
														className="h-9 w-12 cursor-pointer border-0 p-0"
													/>
													<span className="text-xs font-mono text-muted-foreground">
														{titleColor}
													</span>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="badge_color">
													Color del Badge
												</Label>
												<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
													<Input
														id="badge_color"
														name="badge_color"
														type="color"
														value={badgeColor}
														onChange={(event) =>
															setBadgeColor(event.target.value)
														}
														className="h-9 w-12 cursor-pointer border-0 p-0"
													/>
													<span className="text-xs font-mono text-muted-foreground">
														{badgeColor}
													</span>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="button_bg_color">
													Color Botón (fondo)
												</Label>
												<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
													<Input
														id="button_bg_color"
														name="button_bg_color"
														type="color"
														value={buttonBgColor}
														onChange={(event) =>
															setButtonBgColor(event.target.value)
														}
														className="h-9 w-12 cursor-pointer border-0 p-0"
													/>
													<span className="text-xs font-mono text-muted-foreground">
														{buttonBgColor}
													</span>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="button_text_color">
													Color Botón (texto)
												</Label>
												<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
													<Input
														id="button_text_color"
														name="button_text_color"
														type="color"
														value={buttonTextColor}
														onChange={(event) =>
															setButtonTextColor(event.target.value)
														}
														className="h-9 w-12 cursor-pointer border-0 p-0"
													/>
													<span className="text-xs font-mono text-muted-foreground">
														{buttonTextColor}
													</span>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="description_color">
													Color de Descripción
												</Label>
												<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
													<Input
														id="description_color"
														name="description_color"
														type="color"
														value={descriptionColor}
														onChange={(event) =>
															setDescriptionColor(event.target.value)
														}
														className="h-9 w-12 cursor-pointer border-0 p-0"
													/>
													<span className="text-xs font-mono text-muted-foreground">
														{descriptionColor}
													</span>
												</div>
											</div>
										</div>
										<div className="space-y-2">
											<Label>Peso visual del título</Label>
											<Select
												value={titleFontWeight}
												onValueChange={(value) =>
													setTitleFontWeight(
														value as 'bold' | 'black' | 'outline',
													)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona peso" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="bold">Bold</SelectItem>
													<SelectItem value="black">Black</SelectItem>
													<SelectItem value="outline">
														Outline
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="overlay_opacity">
												Overlay de Fondo ({overlayOpacity}%)
											</Label>
											<Input
												id="overlay_opacity"
												name="overlay_opacity"
												type="range"
												min={0}
												max={100}
												value={overlayOpacity}
												onChange={(event) =>
													setOverlayOpacity(
														Number(event.target.value),
													)
												}
											/>
										</div>
									</section>

									<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
										<h3 className="text-sm font-semibold tracking-wide">
											Layout y Meta
										</h3>
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
											<div className="space-y-2">
												<Label>Alineación del contenido</Label>
												<Select
													value={contentAlignment}
													onValueChange={(value) =>
														setContentAlignment(
															value as 'left' | 'center' | 'right',
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Alineación" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="left">
															Izquierda
														</SelectItem>
														<SelectItem value="center">
															Centro
														</SelectItem>
														<SelectItem value="right">
															Derecha
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-2">
												<Label>Altura del banner</Label>
												<Select
													value={bannerHeight}
													onValueChange={(value) =>
														setBannerHeight(
															value as
																| 'normal'
																| 'large'
																| 'fullscreen',
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Altura" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="normal">
															Normal (50vh)
														</SelectItem>
														<SelectItem value="large">
															Grande (75vh)
														</SelectItem>
														<SelectItem value="fullscreen">
															Pantalla Completa
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="internal_description">
												Descripción interna
											</Label>
											<Input
												id="internal_description"
												name="internal_description"
												defaultValue={initialDescription ?? ''}
												placeholder="Notas internas del bloque hero"
											/>
										</div>
									</section>
								</div>
							</aside>
						</div>

						{state.message && (
							<div className="border-t bg-background px-5 py-2">
								<p
									className={`text-sm ${
										state.error
											? 'text-destructive'
											: 'text-green-600'
									}`}
								>
									{state.message}
								</p>
							</div>
						)}
					</form>
				</div>
			)}
		</>
	)
}

export function PromoBannerForm({
	initialData,
	isActive,
	initialDescription,
}: {
	initialData?: PromoBannerConfig
	isActive?: boolean
	initialDescription?: string | null
}) {
	const [state, formAction, isPending] = useActionState(
		updatePromoBanner,
		initialState,
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Banner Promocional</CardTitle>
				<CardDescription>
					Gestiona el mensaje que aparece arriba del todo.
				</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent className="space-y-4">
					<div className="flex items-center space-x-2">
						<Switch
							id="is_active"
							name="is_active"
							defaultChecked={isActive ?? true}
						/>
						<Label htmlFor="is_active">Mostrar Banner</Label>
					</div>

					<div className="space-y-2">
						<Label htmlFor="message">Mensaje</Label>
						<Input
							id="message"
							name="message"
							defaultValue={initialData?.message ?? ''}
							placeholder="Ej: Envio gratis en compras mayores a $50"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="link">Enlace (Opcional)</Label>
						<Input
							id="link"
							name="link"
							defaultValue={initialData?.link ?? ''}
							placeholder="Ej: /producto/oferta"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Descripción interna</Label>
						<Input
							id="description"
							name="description"
							defaultValue={initialDescription ?? ''}
							placeholder="Ayuda interna para admins"
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar Cambios'}
					</Button>
					{state.message && (
						<p
							className={`ml-4 text-sm ${
								state.error ? 'text-destructive' : 'text-green-600'
							}`}
						>
							{state.message}
						</p>
					)}
				</CardFooter>
			</form>
		</Card>
	)
}

export function ContactInfoForm({
	initialData,
	initialDescription,
}: {
	initialData?: ContactInfoConfig
	initialDescription?: string | null
}) {
	const [state, formAction, isPending] = useActionState(
		updateContactInfo,
		initialState,
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Información de Contacto</CardTitle>
				<CardDescription>
					Actualiza los enlaces a redes sociales y contacto.
				</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="whatsapp">WhatsApp</Label>
							<Input
								id="whatsapp"
								name="whatsapp"
								defaultValue={initialData?.whatsapp ?? ''}
								placeholder="Numero completo"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="instagram">Instagram</Label>
							<Input
								id="instagram"
								name="instagram"
								defaultValue={initialData?.instagram ?? ''}
								placeholder="@usuario"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tiktok">TikTok</Label>
							<Input
								id="tiktok"
								name="tiktok"
								defaultValue={initialData?.tiktok ?? ''}
								placeholder="@usuario"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								defaultValue={initialData?.email ?? ''}
								placeholder="contacto@ejemplo.com"
							/>
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="description">Descripción interna</Label>
							<Input
								id="description"
								name="description"
								defaultValue={initialDescription ?? ''}
								placeholder="Contexto interno del bloque"
							/>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar Cambios'}
					</Button>
					{state.message && (
						<p
							className={`ml-4 text-sm ${
								state.error ? 'text-destructive' : 'text-green-600'
							}`}
						>
							{state.message}
						</p>
					)}
				</CardFooter>
			</form>
		</Card>
	)
}
