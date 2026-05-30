import { HeroDropCountdown } from '@/components/HeroDropCountdown'
import { HeroBannerLayout } from '@/components/hero-studio/HeroBannerLayout'
import { HeroCTA } from '@/components/hero-studio/HeroCTA'
import { getHeroLinkedDropSummary } from '@/lib/data/drops'
import {
	getSiteConfig,
	HeroCTAConfig,
	HomeHeroBannerConfig,
	HeroLayoutPreset,
} from '@/lib/data/site-config'
import { getHeroCTAConfig } from '@/lib/services/hero-cta-config'

type StandardHeroConfigInput = {
	enabled?: boolean
	title?: string
	subtitle?: string
	backgroundImage?: string
	overlayOpacity?: number
	alignment?: 'left' | 'center' | 'right'
	cta?: {
		text?: string
		link?: string
		variant?: 'solid' | 'outline' | 'ghost'
	}
}

const fallbackCTA: HeroCTAConfig = {
	text: 'VER COLECCIÓN',
	link: '/#stock',
	openInNewTab: false,
	variant: 'solid',
	size: 'md',
	radius: 'md',
	hoverEffect: 'none',
	alignment: 'left',
	fullWidth: false,
	backgroundColor: '#E62727',
	textColor: '#FFFFFF',
	borderColor: '#E62727',
	hoverBackgroundColor: '#B91C1C',
	hoverTextColor: '#FFFFFF',
}

const fallback: HomeHeroBannerConfig = {
	badge: 'DROP EXCLUSIVO — EDICIÓN LIMITADA',
	title: 'LA CALLE ES NUESTRA',
	description:
		'Piezas únicas que definen el estilo urbano. Una vez que se acaban, no vuelven.',
	cta: fallbackCTA,
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
	hero_badge_pos_x: 50,
	hero_badge_pos_y: 30,
	hero_title_pos_x: 50,
	hero_title_pos_y: 44,
	hero_description_pos_x: 50,
	hero_description_pos_y: 58,
	hero_drop_message_pos_x: 50,
	hero_drop_message_pos_y: 68,
	hero_countdown_pos_x: 50,
	hero_countdown_pos_y: 76,
	hero_live_badge_pos_x: 50,
	hero_live_badge_pos_y: 76,
	hero_text_pos_x: 50,
	hero_text_pos_y: 48,
	hero_cta_pos_x: 50,
	hero_cta_pos_y: 78,
	title_color: '#111111',
	description_color: '#6B7280',
	badge_color: '#E62727',
	title_font_weight: 'black',
	overlay_opacity: 45,
	content_alignment: 'left',
	banner_height: 'large',
	layout_preset: undefined,
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
	const incoming = {
		...(value || {}),
	} as Partial<HomeHeroBannerConfig> & StandardHeroConfigInput

	// Compatibility bridge for the simplified production JSON shape.
	if (incoming.backgroundImage && !incoming.background_image) {
		incoming.background_image = incoming.backgroundImage
	}
	if (incoming.subtitle && !incoming.description) {
		incoming.description = incoming.subtitle
	}
	if (incoming.alignment && !incoming.content_alignment) {
		incoming.content_alignment = incoming.alignment
	}
	if (
		typeof incoming.overlayOpacity === 'number' &&
		typeof incoming.overlay_opacity !== 'number'
	) {
		incoming.overlay_opacity =
			incoming.overlayOpacity <= 1
				? incoming.overlayOpacity * 100
				: incoming.overlayOpacity
	}

	const normalizedCta = getHeroCTAConfig(incoming)

	return {
		...fallback,
		...incoming,
		cta: normalizedCta,
		hero_badge_pos_x:
			typeof value?.hero_badge_pos_x === 'number'
				? Math.max(0, Math.min(100, value.hero_badge_pos_x))
				: fallback.hero_badge_pos_x,
		hero_badge_pos_y:
			typeof value?.hero_badge_pos_y === 'number'
				? Math.max(0, Math.min(100, value.hero_badge_pos_y))
				: fallback.hero_badge_pos_y,
		hero_title_pos_x:
			typeof value?.hero_title_pos_x === 'number'
				? Math.max(0, Math.min(100, value.hero_title_pos_x))
				: typeof value?.hero_text_pos_x === 'number'
					? Math.max(0, Math.min(100, value.hero_text_pos_x))
					: fallback.hero_title_pos_x,
		hero_title_pos_y:
			typeof value?.hero_title_pos_y === 'number'
				? Math.max(0, Math.min(100, value.hero_title_pos_y))
				: typeof value?.hero_text_pos_y === 'number'
					? Math.max(0, Math.min(100, value.hero_text_pos_y))
					: fallback.hero_title_pos_y,
		hero_description_pos_x:
			typeof value?.hero_description_pos_x === 'number'
				? Math.max(0, Math.min(100, value.hero_description_pos_x))
				: typeof value?.hero_text_pos_x === 'number'
					? Math.max(0, Math.min(100, value.hero_text_pos_x))
					: fallback.hero_description_pos_x,
		hero_description_pos_y:
			typeof value?.hero_description_pos_y === 'number'
				? Math.max(0, Math.min(100, value.hero_description_pos_y))
				: typeof value?.hero_text_pos_y === 'number'
					? Math.max(0, Math.min(100, value.hero_text_pos_y))
					: fallback.hero_description_pos_y,
		hero_drop_message_pos_x:
			typeof value?.hero_drop_message_pos_x === 'number'
				? Math.max(0, Math.min(100, value.hero_drop_message_pos_x))
				: fallback.hero_drop_message_pos_x,
		hero_drop_message_pos_y:
			typeof value?.hero_drop_message_pos_y === 'number'
				? Math.max(0, Math.min(100, value.hero_drop_message_pos_y))
				: fallback.hero_drop_message_pos_y,
		hero_countdown_pos_x:
			typeof value?.hero_countdown_pos_x === 'number'
				? Math.max(0, Math.min(100, value.hero_countdown_pos_x))
				: fallback.hero_countdown_pos_x,
		hero_countdown_pos_y:
			typeof value?.hero_countdown_pos_y === 'number'
				? Math.max(0, Math.min(100, value.hero_countdown_pos_y))
				: fallback.hero_countdown_pos_y,
		hero_live_badge_pos_x:
			typeof value?.hero_live_badge_pos_x === 'number'
				? Math.max(0, Math.min(100, value.hero_live_badge_pos_x))
				: fallback.hero_live_badge_pos_x,
		hero_live_badge_pos_y:
			typeof value?.hero_live_badge_pos_y === 'number'
				? Math.max(0, Math.min(100, value.hero_live_badge_pos_y))
				: fallback.hero_live_badge_pos_y,
		hero_text_pos_x:
			typeof value?.hero_text_pos_x === 'number'
				? Math.max(0, Math.min(100, value.hero_text_pos_x))
				: fallback.hero_text_pos_x,
		hero_text_pos_y:
			typeof value?.hero_text_pos_y === 'number'
				? Math.max(0, Math.min(100, value.hero_text_pos_y))
				: fallback.hero_text_pos_y,
		hero_cta_pos_x:
			typeof value?.hero_cta_pos_x === 'number'
				? Math.max(0, Math.min(100, value.hero_cta_pos_x))
				: fallback.hero_cta_pos_x,
		hero_cta_pos_y:
			typeof value?.hero_cta_pos_y === 'number'
				? Math.max(0, Math.min(100, value.hero_cta_pos_y))
				: fallback.hero_cta_pos_y,
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
			value?.drop_message_template_scheduled ??
			fallback.drop_message_template_scheduled,
		drop_message_template_live:
			value?.drop_message_template_live ??
			fallback.drop_message_template_live,
		drop_message_template_ended:
			value?.drop_message_template_ended ??
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
		layout_preset: (
			value?.layout_preset === 'editorial-left' ||
			value?.layout_preset === 'centered' ||
			value?.layout_preset === 'product-right' ||
			value?.layout_preset === 'fullbleed-bottom'
		)
			? value.layout_preset
			: undefined,
	}
}

export async function Hero() {
	const config = await getSiteConfig<HomeHeroBannerConfig>(
		'home_hero_banner',
	)

	const rawValue =
		(config?.value as Partial<HomeHeroBannerConfig> &
			StandardHeroConfigInput) || null

	if (config && !config.is_active) {
		return null
	}

	if (rawValue && rawValue.enabled === false) {
		return null
	}

	const value = normalizeHeroConfig(rawValue)
	const ctaConfig = value.cta ?? fallbackCTA
	const { data: linkedDrop } = await getHeroLinkedDropSummary()

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
			: ctaConfig.text
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
		ctaConfig.link &&
		((ctaState === 'scheduled' && value.drop_show_cta_scheduled) ||
			(ctaState === 'live' && value.drop_show_cta_live) ||
			(ctaState === 'ended' && value.drop_show_cta_ended) ||
			(ctaState === 'default' && true))

	const heightClassBySetting = {
		normal: 'min-h-[50vh]',
		large: 'min-h-[75vh]',
		fullscreen: 'min-h-[100dvh]',
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

	// --- PRESET RENDERING (responsive flow layout) ---
	if (value.layout_preset) {
		const preset = value.layout_preset as HeroLayoutPreset
		const isSplit =
			preset === 'editorial-left' || preset === 'product-right'

		const presetAlignmentClass =
			preset === 'centered' ? 'items-center text-center' : 'items-start text-left'

		const heroImage =
			value.background_image ||
			'https://picsum.photos/seed/etiqueta-roja-hero/1600/900'

		return (
			<HeroBannerLayout
				preset={preset}
				bannerHeight={value.banner_height}
				overlayOpacity={value.overlay_opacity}
				backgroundImage={heroImage}
				backgroundImageMobile={
					value.background_image_mobile || heroImage
				}
				backgroundVideoUrl={isSplit ? '' : (value.background_video_url ?? '')}
				renderEmbeddableVideo={!isSplit}
				showBottomBorder
			>
				<div
					className={`flex flex-col gap-5 ${presetAlignmentClass}`}
				>
					{value.badge && (
						<p
							className="text-sm font-bold tracking-widest"
							style={{ color: value.badge_color }}
						>
							{value.badge}
						</p>
					)}

					<h1
						className={`max-w-2xl text-balance text-5xl leading-none tracking-tighter md:text-6xl lg:text-7xl ${titleWeightClassBySetting[titleFontWeight]}`}
						style={{ color: value.title_color }}
					>
						{value.title}
					</h1>

					{value.description && (
						<p
							className="max-w-md text-lg leading-relaxed"
							style={{ color: value.description_color }}
						>
							{value.description}
						</p>
					)}

					{shouldShowDropMessage && resolvedDropMessage && (
						<p
							className={`max-w-lg text-sm font-semibold tracking-wide ${
								isSplit ? 'text-muted-foreground' : 'text-white/90'
							}`}
						>
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
							className="inline-flex w-fit px-3 py-1 text-xs font-bold tracking-wider"
							style={{
								backgroundColor: value.drop_live_badge_bg_color,
								color: value.drop_live_badge_text_color,
							}}
						>
							{value.drop_live_badge_text}
						</span>
					)}

					{shouldShowCta && (
						<div>
							<HeroCTA
								config={ctaConfig}
								text={ctaLabel}
								href={ctaConfig.link}
								disabled={ctaDisabled}
							/>
						</div>
					)}
				</div>
			</HeroBannerLayout>
		)
	}

	// --- LEGACY RENDERING (absolute coordinate positioning) ---
	return (
		<HeroBannerLayout
			bannerHeight={value.banner_height}
			overlayOpacity={value.overlay_opacity}
			backgroundImage={value.background_image}
			backgroundImageMobile={
				value.background_image_mobile || value.background_image
			}
			backgroundVideoUrl={value.background_video_url}
			renderEmbeddableVideo
			showBottomBorder
		>
			{value.badge && (
				<p
					className={`absolute text-sm font-bold tracking-widest ${alignmentClassBySetting[value.content_alignment]}`}
					style={{
						left: `${value.hero_badge_pos_x}%`,
						top: `${value.hero_badge_pos_y}%`,
						transform: 'translate(-50%, -50%)',
						color: value.badge_color,
					}}
				>
					{value.badge}
				</p>
			)}

			<h1
				className={`absolute max-w-2xl text-balance text-5xl leading-none tracking-tighter md:text-7xl lg:text-8xl ${titleWeightClassBySetting[titleFontWeight]} ${alignmentClassBySetting[value.content_alignment]}`}
				style={{
					left: `${value.hero_title_pos_x}%`,
					top: `${value.hero_title_pos_y}%`,
					transform: 'translate(-50%, -50%)',
					color: value.title_color,
				}}
			>
				{value.title}
			</h1>

			{value.description && (
				<p
					className={`absolute max-w-xl text-lg md:text-xl ${alignmentClassBySetting[value.content_alignment]}`}
					style={{
						left: `${value.hero_description_pos_x}%`,
						top: `${value.hero_description_pos_y}%`,
						transform: 'translate(-50%, -50%)',
						color: value.description_color,
					}}
				>
					{value.description}
				</p>
			)}

			{shouldShowDropMessage && resolvedDropMessage && (
				<p
					className={`absolute max-w-lg text-sm font-semibold tracking-wide text-white/90 ${dropTextAlignmentClass}`}
					style={{
						left: `${value.hero_drop_message_pos_x}%`,
						top: `${value.hero_drop_message_pos_y}%`,
						transform: 'translate(-50%, -50%)',
					}}
				>
					{resolvedDropMessage}
				</p>
			)}

			{shouldShowCountdown && linkedDrop?.start_time && (
				<div
					className="absolute"
					style={{
						left: `${value.hero_countdown_pos_x}%`,
						top: `${value.hero_countdown_pos_y}%`,
						transform: 'translate(-50%, -50%)',
					}}
				>
					<HeroDropCountdown
						targetDate={linkedDrop.start_time}
						containerBgColor={value.drop_countdown_bg_color}
						unitBgColor="rgba(0,0,0,0.35)"
						textColor={value.drop_countdown_text_color}
					/>
				</div>
			)}

			{shouldShowLiveBadge && (
				<span
					className="absolute inline-flex w-fit rounded-md px-3 py-1 text-xs font-bold tracking-wider"
					style={{
						left: `${value.hero_live_badge_pos_x}%`,
						top: `${value.hero_live_badge_pos_y}%`,
						transform: 'translate(-50%, -50%)',
						backgroundColor: value.drop_live_badge_bg_color,
						color: value.drop_live_badge_text_color,
					}}
				>
					{value.drop_live_badge_text}
				</span>
			)}

			{shouldShowCta && (
				<div
					className="absolute"
					style={{
						left: `${value.hero_cta_pos_x}%`,
						top: `${value.hero_cta_pos_y}%`,
						transform: 'translate(-50%, -50%)',
					}}
				>
					<HeroCTA
						config={ctaConfig}
						text={ctaLabel}
						href={ctaConfig.link}
						disabled={ctaDisabled}
					/>
				</div>
			)}
		</HeroBannerLayout>
	)
}
