// lib/hero/presets.ts
export type HeroLayoutPreset =
	| 'editorial-left'
	| 'centered'
	| 'product-right'
	| 'fullbleed-bottom'

export interface HeroPresetMeta {
	value: HeroLayoutPreset
	label: string
	description: string
	/** Glifo monoespaciado para la tarjeta del selector. */
	visual: string
	/** Ayuda contextual / caso de uso para el admin. */
	helpText: string
}

export const HERO_LAYOUT_PRESETS: readonly HeroPresetMeta[] = [
	{
		value: 'editorial-left',
		label: 'Editorial',
		description: 'Texto izquierda, foto derecha (50/50)',
		visual: '▐▌',
		helpText:
			'Copy alineado a la izquierda con la foto cubriendo la mitad derecha (50/50). Ideal para el drop de un producto individual.',
	},
	{
		value: 'centered',
		label: 'Centrado',
		description: 'Foto full-bleed, copy centrado',
		visual: '▬',
		helpText:
			'Foto a sangre completa con overlay y copy centrado. Ideal para el hero de temporada.',
	},
	{
		value: 'product-right',
		label: 'Producto',
		description: 'Foto dominante derecha (40/60)',
		visual: '▐▐▌',
		helpText:
			'Producto a gran escala a la derecha, copy a la izquierda. Ideal para un nuevo drop prominente.',
	},
	{
		value: 'fullbleed-bottom',
		label: 'Cine',
		description: 'Foto full-bleed, texto al fondo',
		visual: '▬▄',
		helpText:
			'Foto a sangre completa con el copy en el tercio inferior. Estética cinematográfica/editorial.',
	},
]

export const DEFAULT_HERO_PRESET: HeroLayoutPreset = 'fullbleed-bottom'

/** Imagen de relleno solo para desarrollo/preview cuando aún no hay foto. */
export const DEV_HERO_FALLBACK =
	'https://picsum.photos/seed/etiqueta-roja-hero/1600/900'

const PRESET_VALUES = new Set<HeroLayoutPreset>(
	HERO_LAYOUT_PRESETS.map((preset) => preset.value),
)

export function isHeroLayoutPreset(
	value: unknown,
): value is HeroLayoutPreset {
	return (
		typeof value === 'string' &&
		PRESET_VALUES.has(value as HeroLayoutPreset)
	)
}

/** Presets de dos columnas (imagen + contenido lado a lado). */
export function isSplitPreset(preset?: HeroLayoutPreset): boolean {
	return preset === 'editorial-left' || preset === 'product-right'
}

export type HeroTitleFontWeight = 'bold' | 'black' | 'outline'
export type HeroContentAlignment = 'left' | 'center' | 'right'

export function titleWeightClass(weight: HeroTitleFontWeight): string {
	if (weight === 'bold') return 'font-bold'
	if (weight === 'outline') {
		return 'font-black text-transparent [-webkit-text-stroke:2px_currentColor]'
	}
	return 'font-black'
}

/** `sizes` óptimo para la imagen LCP según el preset. */
export function heroImageSizes(preset: HeroLayoutPreset): string {
	if (preset === 'product-right') return '(min-width: 768px) 60vw, 100vw'
	if (preset === 'editorial-left') return '(min-width: 768px) 50vw, 100vw'
	return '100vw'
}
