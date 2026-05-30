// lib/hero/validation.ts

export const MAX_SUBTITLE_WORDS = 20
export const TITLE_SOFT_MAX = 48

export function countWords(value: string): number {
	const trimmed = value.trim()
	if (!trimmed) return 0
	return trimmed.split(/\s+/).length
}

export interface HeroValidationInput {
	backgroundImage: string
	description: string
}

export interface HeroValidationResult {
	ok: boolean
	errors: {
		backgroundImage?: string
		description?: string
	}
}

/**
 * Reglas que bloquean el guardado del hero. Compartida entre la UI
 * (deshabilitar el botón) y el server action (defensa server-side).
 */
export function validateHeroForSave(
	input: HeroValidationInput,
): HeroValidationResult {
	const errors: HeroValidationResult['errors'] = {}

	if (!input.backgroundImage.trim()) {
		errors.backgroundImage = 'La imagen de fondo es obligatoria.'
	}

	if (countWords(input.description) > MAX_SUBTITLE_WORDS) {
		errors.description = `El subtítulo no puede superar ${MAX_SUBTITLE_WORDS} palabras.`
	}

	return { ok: Object.keys(errors).length === 0, errors }
}
