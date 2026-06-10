// Fuente de verdad compartida para el estado de la página de búsqueda.
// Es un módulo puro (sin React, sin Supabase) para poder usarse tanto en
// Server Components / Server Actions como en Client Components.

export type SearchSort = 'nuevo' | 'precio-asc' | 'precio-desc' | 'az' | 'za'

export interface SearchFilters {
	q: string
	categoria: string | null // slug de categoría
	coleccion: string | null // slug de drop/colección
	tallas: string[] // etiquetas de talla en mayúsculas (ej. ['M', 'L'])
	disponible: boolean // solo productos con stock
	precioMin: number | null
	precioMax: number | null
	orden: SearchSort
}

export const DEFAULT_SORT: SearchSort = 'nuevo'

export const SORT_OPTIONS: ReadonlyArray<{
	value: SearchSort
	label: string
}> = [
	{ value: 'nuevo', label: 'Más recientes' },
	{ value: 'precio-asc', label: 'Precio: menor a mayor' },
	{ value: 'precio-desc', label: 'Precio: mayor a menor' },
	{ value: 'az', label: 'Alfabético: A–Z' },
	{ value: 'za', label: 'Alfabético: Z–A' },
]

const VALID_SORTS = new Set<SearchSort>(SORT_OPTIONS.map((o) => o.value))

// Orden canónico de tallas para presentarlas de forma predecible en la UI.
const SIZE_ORDER = [
	'XXS',
	'XS',
	'S',
	'M',
	'L',
	'XL',
	'XXL',
	'XXXL',
	'UNICA',
]

export function sortSizes(sizes: string[]): string[] {
	return [...sizes].sort((a, b) => {
		const ia = SIZE_ORDER.indexOf(a)
		const ib = SIZE_ORDER.indexOf(b)
		if (ia !== -1 && ib !== -1) return ia - ib
		if (ia !== -1) return -1
		if (ib !== -1) return 1
		return a.localeCompare(b, 'es')
	})
}

// Convierte una etiqueta de talla visible (ej. "M") al valor normalizado
// usado dentro de combination_key (`size:<valor>`). Reproduce la
// normalización del admin: minúsculas + espacios → guiones.
export function sizeLabelToKeyValue(label: string): string {
	return label
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
}

// Lee los filtros desde cualquier fuente tipo searchParams (objeto plano de
// Next o URLSearchParams). Valores inválidos caen a su default seguro.
// Acepta tanto URLSearchParams / ReadonlyURLSearchParams (que exponen .get)
// como el objeto plano de searchParams de un Server Component.
type ParamsLike = { get(key: string): string | null }
type ParamsInput =
	| ParamsLike
	| Record<string, string | string[] | undefined>

function isParamsLike(params: ParamsInput): params is ParamsLike {
	return typeof (params as ParamsLike).get === 'function'
}

function readParam(
	params: ParamsInput,
	key: string,
): string | undefined {
	if (isParamsLike(params)) {
		return params.get(key) ?? undefined
	}
	const raw = params[key]
	if (Array.isArray(raw)) return raw[0]
	return raw
}

function parsePositiveInt(value: string | undefined): number | null {
	if (!value) return null
	const n = Number.parseInt(value, 10)
	return Number.isFinite(n) && n >= 0 ? n : null
}

export function parseSearchFilters(params: ParamsInput): SearchFilters {
	const rawOrden = readParam(params, 'orden') as SearchSort | undefined
	const orden =
		rawOrden && VALID_SORTS.has(rawOrden) ? rawOrden : DEFAULT_SORT

	const tallasRaw = readParam(params, 'talla')
	const tallas = tallasRaw
		? Array.from(
				new Set(
					tallasRaw
						.split(',')
						.map((t) => t.trim().toUpperCase())
						.filter(Boolean),
				),
			)
		: []

	let precioMin = parsePositiveInt(readParam(params, 'precio_min'))
	let precioMax = parsePositiveInt(readParam(params, 'precio_max'))
	// Normaliza un rango invertido para evitar consultas vacías accidentales.
	if (precioMin != null && precioMax != null && precioMin > precioMax) {
		;[precioMin, precioMax] = [precioMax, precioMin]
	}

	return {
		q: (readParam(params, 'q') ?? '').trim(),
		categoria: readParam(params, 'categoria')?.trim() || null,
		coleccion: readParam(params, 'coleccion')?.trim() || null,
		tallas,
		disponible: readParam(params, 'disponible') === '1',
		precioMin,
		precioMax,
		orden,
	}
}

// Serializa los filtros a una query string canónica. Omite los valores en su
// default para mantener URLs limpias y compartibles.
export function buildSearchQuery(filters: SearchFilters): string {
	const params = new URLSearchParams()
	if (filters.q) params.set('q', filters.q)
	if (filters.categoria) params.set('categoria', filters.categoria)
	if (filters.coleccion) params.set('coleccion', filters.coleccion)
	if (filters.tallas.length)
		params.set('talla', sortSizes(filters.tallas).join(','))
	if (filters.disponible) params.set('disponible', '1')
	if (filters.precioMin != null)
		params.set('precio_min', String(filters.precioMin))
	if (filters.precioMax != null)
		params.set('precio_max', String(filters.precioMax))
	if (filters.orden !== DEFAULT_SORT) params.set('orden', filters.orden)
	return params.toString()
}

// Número de filtros activos (excluye el texto de búsqueda y el orden, que
// tienen su propia UI). Útil para badges en el botón de filtros móvil.
export function countActiveFilters(filters: SearchFilters): number {
	let n = 0
	if (filters.categoria) n++
	if (filters.coleccion) n++
	if (filters.disponible) n++
	n += filters.tallas.length
	if (filters.precioMin != null || filters.precioMax != null) n++
	return n
}

export function hasAnyFilter(filters: SearchFilters): boolean {
	return (
		countActiveFilters(filters) > 0 ||
		filters.q !== '' ||
		filters.orden !== DEFAULT_SORT
	)
}
