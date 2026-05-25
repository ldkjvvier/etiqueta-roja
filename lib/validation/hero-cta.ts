import { z } from 'zod'

export type HeroCTAConfig = {
	text: string
	link: string
	openInNewTab: boolean
	variant: 'solid' | 'outline' | 'ghost'
	size: 'sm' | 'md' | 'lg'
	radius: 'none' | 'sm' | 'md' | 'lg' | 'full'
	hoverEffect: 'none' | 'lift' | 'scale' | 'invert'
	alignment: 'left' | 'center' | 'right'
	fullWidth: boolean
	backgroundColor: string
	textColor: string
	borderColor: string
	hoverBackgroundColor: string
	hoverTextColor: string
}

const colorSchema = z
	.string()
	.min(1)
	.max(32)
	.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
		message:
			'Invalid color format. Expected hex value (#RGB or #RRGGBB).',
	})

export const HeroCTAConfigSchema = z.object({
	text: z.string().max(80),
	link: z.string().max(2048),
	openInNewTab: z.boolean(),
	variant: z.enum(['solid', 'outline', 'ghost']),
	size: z.enum(['sm', 'md', 'lg']),
	radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
	hoverEffect: z.enum(['none', 'lift', 'scale', 'invert']),
	alignment: z.enum(['left', 'center', 'right']),
	fullWidth: z.boolean(),
	backgroundColor: colorSchema,
	textColor: colorSchema,
	borderColor: colorSchema,
	hoverBackgroundColor: colorSchema,
	hoverTextColor: colorSchema,
})

type HeroCTALegacySource = {
	ctaText?: string
	ctaLink?: string
	buttonBgColor?: string
	buttonTextColor?: string
}

export function createDefaultHeroCTAConfig(
	legacy: HeroCTALegacySource = {},
): HeroCTAConfig {
	const baseBg = legacy.buttonBgColor || '#E62727'
	const baseText = legacy.buttonTextColor || '#FFFFFF'

	return {
		text: legacy.ctaText || '',
		link: legacy.ctaLink || '',
		openInNewTab: false,
		variant: 'solid',
		size: 'md',
		radius: 'md',
		hoverEffect: 'none',
		alignment: 'left',
		fullWidth: false,
		backgroundColor: baseBg,
		textColor: baseText,
		borderColor: baseBg,
		hoverBackgroundColor: baseBg,
		hoverTextColor: baseText,
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

export function parseHeroCTAConfig(
	input: unknown,
	legacy: HeroCTALegacySource = {},
) {
	const defaults = createDefaultHeroCTAConfig(legacy)
	const candidate = isRecord(input)
		? { ...defaults, ...input }
		: defaults

	return HeroCTAConfigSchema.safeParse(candidate)
}

export const heroCTAConfigSchema = HeroCTAConfigSchema
