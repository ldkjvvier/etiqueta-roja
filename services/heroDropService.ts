import {
	HeroDropOption,
	HeroDropStatus,
	HeroStudioState,
} from '@/types/heroStudio.types'

export interface HeroDropPreview {
	status: HeroDropStatus | null
	message: string
	showMessage: boolean
	showCountdown: boolean
	showLiveBadge: boolean
	showCta: boolean
	ctaText: string
	ctaDisabled: boolean
	dateLabel: string
	time12Label: string
	time24Label: string
	endDateLabel: string
	endTime12Label: string
	endTime24Label: string
	countdownTarget?: string
}

const locale = 'es-CL'

const clamp = (value: number, min: number, max: number) =>
	Math.max(min, Math.min(max, value))

function formatDate(
	value: string | null | undefined,
	mode: HeroStudioState['dropConfig']['dropDateFormat'],
) {
	if (!value) return ''
	const date = new Date(value)
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

	return new Intl.DateTimeFormat(locale, optionsByMode[mode]).format(
		date,
	)
}

function formatTime(
	value: string | null | undefined,
	mode: '12' | '24',
) {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return ''

	return new Intl.DateTimeFormat(locale, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: mode === '12',
	}).format(date)
}

function applyTemplate(
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

export function resolveDropStatusForPreview(
	drop: HeroDropOption | undefined,
	nowMs: number,
): HeroDropStatus | null {
	if (!drop) {
		return null
	}

	const startMs = new Date(drop.start_time).getTime()
	const endMs = drop.end_time
		? new Date(drop.end_time).getTime()
		: null

	if (!Number.isNaN(startMs)) {
		if (nowMs < startMs) return 'scheduled'
		if (endMs && !Number.isNaN(endMs) && nowMs >= endMs)
			return 'ended'
		return 'live'
	}

	return drop.status
}

export function buildDropPreview(
	state: HeroStudioState,
	drop: HeroDropOption | undefined,
	nowMs: number,
): HeroDropPreview {
	const status = resolveDropStatusForPreview(drop, nowMs)
	const dateLabel = formatDate(
		drop?.start_time,
		state.dropConfig.dropDateFormat,
	)
	const time12Label = formatTime(drop?.start_time, '12')
	const time24Label = formatTime(drop?.start_time, '24')
	const endDateLabel = formatDate(
		drop?.end_time,
		state.dropConfig.dropDateFormat,
	)
	const endTime12Label = formatTime(drop?.end_time, '12')
	const endTime24Label = formatTime(drop?.end_time, '24')

	const dateShort = drop?.start_time
		? (() => {
				const date = new Date(drop.start_time)
				if (Number.isNaN(date.getTime())) return ''
				return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
			})()
		: ''
	const dateLong = drop?.start_time
		? new Intl.DateTimeFormat(locale, {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}).format(new Date(drop.start_time))
		: ''
	const dateFull = drop?.start_time
		? new Intl.DateTimeFormat(locale, {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}).format(new Date(drop.start_time))
		: ''

	const params = {
		status: status ?? '',
		date: dateLabel,
		time: time12Label,
		time_12: time12Label,
		time_24: time24Label,
		date_short: dateShort,
		date_long: dateLong,
		date_full: dateFull,
		end_date: endDateLabel,
		end_time_12: endTime12Label,
		end_time_24: endTime24Label,
		start_iso: drop?.start_time ?? '',
		end_iso: drop?.end_time ?? '',
	}

	const message =
		status === 'scheduled'
			? applyTemplate(
					state.dropConfig.dropMessageTemplateScheduled,
					params,
				)
			: status === 'live'
				? applyTemplate(
						state.dropConfig.dropMessageTemplateLive,
						params,
					)
				: status === 'ended'
					? applyTemplate(
							state.dropConfig.dropMessageTemplateEnded,
							params,
						)
					: ''

	const ctaText =
		status === 'ended'
			? state.dropConfig.dropEndedText || 'SOLD OUT'
			: state.cta.text

	const ctaDisabled = status === 'scheduled' || status === 'ended'

	const showCountdown =
		state.dropConfig.dropDisplayMode !== 'hidden' &&
		state.dropConfig.dropDisplayMode !== 'message-only' &&
		state.dropConfig.dropDisplayMode !== 'badge-only' &&
		state.dropConfig.dropShowCountdown &&
		status === 'scheduled'

	const showLiveBadge =
		state.dropConfig.dropDisplayMode !== 'hidden' &&
		state.dropConfig.dropDisplayMode !== 'message-only' &&
		state.dropConfig.dropDisplayMode !== 'countdown-only' &&
		state.dropConfig.dropShowLiveBadge &&
		status === 'live'

	const showMessage =
		state.dropConfig.dropDisplayMode === 'message-only' ||
		(state.dropConfig.dropDisplayMode !== 'hidden' &&
			Boolean(message))

	const showCta =
		state.dropConfig.dropDisplayMode !== 'hidden' &&
		Boolean(ctaText) &&
		((status === 'scheduled' &&
			state.dropConfig.dropShowCtaScheduled) ||
			(status === 'live' && state.dropConfig.dropShowCtaLive) ||
			(status === 'ended' && state.dropConfig.dropShowCtaEnded) ||
			(!status && true))

	return {
		status,
		message,
		showMessage,
		showCountdown,
		showLiveBadge,
		showCta,
		ctaText,
		ctaDisabled,
		dateLabel,
		time12Label,
		time24Label,
		endDateLabel,
		endTime12Label,
		endTime24Label,
		countdownTarget: drop?.start_time,
	}
}

export function isValidExternalVideoUrl(url: string) {
	if (!url.trim()) {
		return true
	}

	try {
		const parsed = new URL(url)
		return parsed.protocol === 'https:' || parsed.protocol === 'http:'
	} catch {
		return false
	}
}

export function clampPercent(value: number) {
	return clamp(value, 0, 100)
}
