import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroDropCountdown } from '@/components/HeroDropCountdown'
import { getHeroLinkedDropSummary } from '@/lib/services/drops-server'
import {
	getSiteConfig,
	HomeHeroBannerConfig,
} from '@/lib/services/site-config-server'

const fallback: HomeHeroBannerConfig = {
	badge: 'DROP EXCLUSIVO — EDICIÓN LIMITADA',
	title: 'LA CALLE ES NUESTRA',
	description:
		'Piezas únicas que definen el estilo urbano. Una vez que se acaban, no vuelven.',
	cta_text: 'VER COLECCIÓN',
	cta_link: '/#stock',
	background_image: '',
	background_image_mobile: '',
	background_video_url: '',
	linked_drop_id: '',
	drop_ended_text: 'SOLD OUT',
	drop_live_badge_text: 'LIVE NOW',
	drop_countdown_bg_color: '#0A0A0A',
	drop_countdown_text_color: '#FFFFFF',
	drop_live_badge_bg_color: '#E62727',
	drop_live_badge_text_color: '#FFFFFF',
	drop_display_mode: 'auto',
	drop_message_template_scheduled:
		'Drop starts on {date_short} at {time_12}',
	drop_message_template_live: 'Drop live now',
	drop_message_template_ended: 'Drop finished on {date_short}',
	drop_text_alignment: 'left',
	drop_date_format: 'long',
	drop_show_cta_scheduled: false,
	drop_show_cta_live: true,
	drop_show_cta_ended: true,
	drop_show_countdown: true,
	drop_show_live_badge: true,
	title_color: '#111111',
	description_color: '#6B7280',
	badge_color: '#E62727',
	button_bg_color: '#E62727',
	button_text_color: '#FFFFFF',
	title_font_weight: 'black',
	overlay_opacity: 45,
	content_alignment: 'left',
	banner_height: 'large',
}

function isLikelyExternalVideoUrl(url: string) {
	if (!url) return false
	try {
		const parsed = new URL(url)
		return parsed.protocol === 'https:' || parsed.protocol === 'http:'
	} catch {
		return false
	}
}

function isEmbeddableVideoUrl(url: string) {
	const normalized = url.toLowerCase()
	return (
		normalized.includes('vimeo.com') ||
		normalized.includes('youtube.com') ||
		normalized.includes('youtu.be')
	)
}

function formatDropDate(
	dateValue: string | null | undefined,
	mode: 'short' | 'long' | 'full',
) {
	if (!dateValue) return ''
	const date = new Date(dateValue)
	if (Number.isNaN(date.getTime())) return ''

	if (mode === 'short') {
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
		optionsByMode[mode as 'long' | 'full'],
	).format(date)
}

function formatDropTime(
	dateValue: string | null | undefined,
	mode: '12' | '24',
) {
	if (!dateValue) return ''
	const date = new Date(dateValue)
	if (Number.isNaN(date.getTime())) return ''

	return new Intl.DateTimeFormat('es-CL', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: mode === '12',
	}).format(date)
}

function applyDropTemplate(
	template: string,
	params: Record<string, string>,
) {
	return template.replace(
		/\{([a-zA-Z0-9_]+)\}/g,
		(_, key: string) => {
			return params[key] ?? ''
		},
	)
}

function normalizeHeroConfig(
	value?: Partial<HomeHeroBannerConfig> | null,
): HomeHeroBannerConfig {
	return {
		...fallback,
		...(value || {}),
		background_image_mobile:
			value?.background_image_mobile || fallback.background_image,
		background_video_url:
			typeof value?.background_video_url === 'string' &&
			isLikelyExternalVideoUrl(value.background_video_url)
				? value.background_video_url
				: '',
		linked_drop_id: value?.linked_drop_id || '',
		drop_ended_text:
			value?.drop_ended_text || fallback.drop_ended_text,
		drop_live_badge_text:
			value?.drop_live_badge_text || fallback.drop_live_badge_text,
		drop_countdown_bg_color:
			value?.drop_countdown_bg_color ||
			fallback.drop_countdown_bg_color,
		drop_countdown_text_color:
			value?.drop_countdown_text_color ||
			fallback.drop_countdown_text_color,
		drop_live_badge_bg_color:
			value?.drop_live_badge_bg_color ||
			fallback.drop_live_badge_bg_color,
		drop_live_badge_text_color:
			value?.drop_live_badge_text_color ||
			fallback.drop_live_badge_text_color,
		drop_display_mode:
			value?.drop_display_mode || fallback.drop_display_mode,
		drop_message_template_scheduled:
			value?.drop_message_template_scheduled ||
			fallback.drop_message_template_scheduled,
		drop_message_template_live:
			value?.drop_message_template_live ||
			fallback.drop_message_template_live,
		drop_message_template_ended:
			value?.drop_message_template_ended ||
			fallback.drop_message_template_ended,
		drop_text_alignment:
			value?.drop_text_alignment === 'center' ||
			value?.drop_text_alignment === 'right'
				? value.drop_text_alignment
				: 'left',
		drop_date_format:
			value?.drop_date_format === 'short' ||
			value?.drop_date_format === 'full'
				? value.drop_date_format
				: 'long',
		drop_show_cta_scheduled:
			typeof value?.drop_show_cta_scheduled === 'boolean'
				? value.drop_show_cta_scheduled
				: false,
		drop_show_cta_live:
			typeof value?.drop_show_cta_live === 'boolean'
				? value.drop_show_cta_live
				: true,
		drop_show_cta_ended:
			typeof value?.drop_show_cta_ended === 'boolean'
				? value.drop_show_cta_ended
				: true,
		drop_show_countdown:
			typeof value?.drop_show_countdown === 'boolean'
				? value.drop_show_countdown
				: true,
		drop_show_live_badge:
			typeof value?.drop_show_live_badge === 'boolean'
				? value.drop_show_live_badge
				: true,
		description_color:
			value?.description_color || fallback.description_color,
		title_font_weight:
			value?.title_font_weight === 'bold' ||
			value?.title_font_weight === 'outline'
				? value.title_font_weight
				: 'black',
		overlay_opacity:
			typeof value?.overlay_opacity === 'number'
				? Math.max(0, Math.min(100, value.overlay_opacity))
				: fallback.overlay_opacity,
		content_alignment:
			value?.content_alignment === 'center' ||
			value?.content_alignment === 'right'
				? value.content_alignment
				: 'left',
		banner_height:
			value?.banner_height === 'normal' ||
			value?.banner_height === 'fullscreen'
				? value.banner_height
				: 'large',
	}
}

export async function Hero() {
	const config = await getSiteConfig<HomeHeroBannerConfig>(
		'home_hero_banner',
	)

	if (config && !config.is_active) {
		return null
	}

	const value = normalizeHeroConfig(config?.value)
	const linkedDrop = await getHeroLinkedDropSummary(
		value.linked_drop_id,
	)

	const ctaState: 'default' | 'scheduled' | 'live' | 'ended' =
		linkedDrop?.status === 'scheduled'
			? 'scheduled'
			: linkedDrop?.status === 'live'
				? 'live'
				: linkedDrop?.status === 'ended'
					? 'ended'
					: 'default'

	const ctaLabel =
		ctaState === 'ended'
			? value.drop_ended_text || 'SOLD OUT'
			: value.cta_text
	const ctaDisabled = ctaState === 'scheduled' || ctaState === 'ended'

	const dropTextAlignmentClass =
		value.drop_text_alignment === 'center'
			? 'items-center text-center'
			: value.drop_text_alignment === 'right'
				? 'items-end text-right'
				: 'items-start text-left'

	const dropDateLabel = formatDropDate(
		linkedDrop?.start_time,
		value.drop_date_format || 'long',
	)
	const dropTime12Label = formatDropTime(linkedDrop?.start_time, '12')
	const dropTime24Label = formatDropTime(linkedDrop?.start_time, '24')
	const dropEndDateLabel = formatDropDate(
		linkedDrop?.end_time,
		value.drop_date_format || 'long',
	)
	const dropEndTime12Label = formatDropTime(
		linkedDrop?.end_time,
		'12',
	)
	const dropEndTime24Label = formatDropTime(
		linkedDrop?.end_time,
		'24',
	)
	const dropDateShort = formatDropDate(
		linkedDrop?.start_time,
		'short',
	)
	const dropDateLong = formatDropDate(linkedDrop?.start_time, 'long')
	const dropDateFull = formatDropDate(linkedDrop?.start_time, 'full')

	const dropMessageByState =
		ctaState === 'scheduled'
			? value.drop_message_template_scheduled
			: ctaState === 'live'
				? value.drop_message_template_live
				: ctaState === 'ended'
					? value.drop_message_template_ended
					: ''

	const resolvedDropMessage = dropMessageByState
		? applyDropTemplate(dropMessageByState, {
				status: ctaState,
				date: dropDateLabel,
				time: dropTime12Label,
				date_short: dropDateShort,
				date_long: dropDateLong,
				date_full: dropDateFull,
				time_12: dropTime12Label,
				time_24: dropTime24Label,
				end_date: dropEndDateLabel,
				end_time_12: dropEndTime12Label,
				end_time_24: dropEndTime24Label,
				start_iso: linkedDrop?.start_time ?? '',
				end_iso: linkedDrop?.end_time ?? '',
			})
		: ''

	const shouldShowCountdown =
		value.drop_display_mode !== 'hidden' &&
		value.drop_display_mode !== 'message-only' &&
		value.drop_display_mode !== 'badge-only' &&
		value.drop_show_countdown &&
		ctaState === 'scheduled'

	const shouldShowLiveBadge =
		value.drop_display_mode !== 'hidden' &&
		value.drop_display_mode !== 'message-only' &&
		value.drop_display_mode !== 'countdown-only' &&
		value.drop_show_live_badge &&
		ctaState === 'live' &&
		Boolean(value.drop_live_badge_text)

	const shouldShowDropMessage =
		value.drop_display_mode === 'message-only' ||
		(value.drop_display_mode !== 'hidden' &&
			Boolean(resolvedDropMessage))

	const shouldShowCta =
		value.drop_display_mode !== 'hidden' &&
		ctaLabel &&
		value.cta_link &&
		((ctaState === 'scheduled' && value.drop_show_cta_scheduled) ||
			(ctaState === 'live' && value.drop_show_cta_live) ||
			(ctaState === 'ended' && value.drop_show_cta_ended) ||
			(ctaState === 'default' && true))

	const heightClassBySetting = {
		normal: 'min-h-[50vh]',
		large: 'min-h-[75vh]',
		fullscreen: 'min-h-screen',
	} as const

	const alignmentClassBySetting = {
		left: 'items-start text-left',
		center: 'items-center text-center',
		right: 'items-end text-right',
	} as const

	const titleWeightClassBySetting = {
		bold: 'font-bold',
		black: 'font-black',
		outline:
			'font-black text-transparent [-webkit-text-stroke:2px_currentColor]',
	} as const

	const titleFontWeight =
		value.title_font_weight === 'bold' ||
		value.title_font_weight === 'outline' ||
		value.title_font_weight === 'black'
			? value.title_font_weight
			: 'black'

	return (
		<section className="relative overflow-hidden border-b border-border bg-secondary">
			{value.background_video_url ? (
				isEmbeddableVideoUrl(value.background_video_url) ? (
					<iframe
						src={value.background_video_url}
						className="pointer-events-none absolute inset-0 h-full w-full"
						title="Hero background video"
						allow="autoplay; fullscreen; picture-in-picture"
						loading="lazy"
					/>
				) : (
					<video
						className="pointer-events-none absolute inset-0 h-full w-full object-cover"
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
					>
						<source src={value.background_video_url} />
					</video>
				)
			) : value.background_image ? (
				<>
					<picture>
						<source
							media="(max-width: 767px)"
							srcSet={
								value.background_image_mobile ||
								value.background_image
							}
						/>
						<img
							src={value.background_image}
							alt="Hero background"
							className="absolute inset-0 h-full w-full object-cover"
							loading="eager"
						/>
					</picture>
				</>
			) : null}

			<div
				className="absolute inset-0 z-0 bg-black"
				style={{ opacity: value.overlay_opacity / 100 }}
			/>

			<div className="relative z-10 container mx-auto px-4">
				<div
					className={`flex ${heightClassBySetting[value.banner_height]} flex-col justify-center py-14`}
				>
					<div
						className={`flex w-full flex-col ${alignmentClassBySetting[value.content_alignment]}`}
					>
						<div className="max-w-2xl">
							{value.badge && (
								<p
									className="mb-4 text-sm font-bold tracking-widest"
									style={{ color: value.badge_color }}
								>
									{value.badge}
								</p>
							)}

							<h1
								className={`mb-6 text-balance text-5xl leading-none tracking-tighter md:text-7xl lg:text-8xl ${titleWeightClassBySetting[titleFontWeight]}`}
								style={{ color: value.title_color }}
							>
								{value.title}
							</h1>

							{value.description && (
								<p
									className="mb-8 max-w-xl text-lg md:text-xl"
									style={{ color: value.description_color }}
								>
									{value.description}
								</p>
							)}

							<div
								className={`mb-3 flex flex-col ${dropTextAlignmentClass}`}
							>
								{shouldShowDropMessage && resolvedDropMessage && (
									<p className="mb-3 text-sm font-semibold tracking-wide text-white/90">
										{resolvedDropMessage}
									</p>
								)}

								{shouldShowCountdown && linkedDrop?.start_time && (
									<HeroDropCountdown
										targetDate={linkedDrop.start_time}
										containerBgColor={value.drop_countdown_bg_color}
										unitBgColor="rgba(0,0,0,0.35)"
										textColor={value.drop_countdown_text_color}
									/>
								)}

								{shouldShowLiveBadge && (
									<span
										className="mb-3 inline-flex w-fit rounded-md px-3 py-1 text-xs font-bold tracking-wider"
										style={{
											backgroundColor: value.drop_live_badge_bg_color,
											color: value.drop_live_badge_text_color,
										}}
									>
										{value.drop_live_badge_text}
									</span>
								)}
							</div>

							{shouldShowCta &&
								(ctaDisabled ? (
									<Button
										disabled
										tabIndex={-1}
										aria-disabled="true"
										className="cursor-not-allowed px-10 py-6 text-base font-bold opacity-80"
										style={{
											backgroundColor: value.button_bg_color,
											color: value.button_text_color,
										}}
									>
										{ctaLabel}
									</Button>
								) : (
									<Button
										asChild
										className="px-10 py-6 text-base font-bold"
										style={{
											backgroundColor: value.button_bg_color,
											color: value.button_text_color,
										}}
									>
										<Link href={value.cta_link}>{ctaLabel}</Link>
									</Button>
								))}
						</div>
					</div>
				</div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
		</section>
	)
}
