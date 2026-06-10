'use client'

import { X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { SearchFacets } from '@/lib/services/products-server'
import {
	countActiveFilters,
	type SearchFilters,
} from '@/lib/search/filters'

interface Props {
	filters: SearchFilters
	facets: SearchFacets
	apply: (update: Partial<SearchFilters>) => void
	onClearAll: () => void
}

type Chip = { key: string; label: string; clear: Partial<SearchFilters> }

export function ActiveFilterChips({
	filters,
	facets,
	apply,
	onClearAll,
}: Props) {
	const chips: Chip[] = []

	if (filters.disponible) {
		chips.push({
			key: 'disponible',
			label: 'Disponibles',
			clear: { disponible: false },
		})
	}

	for (const size of filters.tallas) {
		chips.push({
			key: `talla-${size}`,
			label: `Talla ${size}`,
			clear: { tallas: filters.tallas.filter((s) => s !== size) },
		})
	}

	if (filters.categoria) {
		const name =
			facets.categories.find((c) => c.slug === filters.categoria)?.name ??
			filters.categoria
		chips.push({
			key: 'categoria',
			label: name,
			clear: { categoria: null },
		})
	}

	if (filters.coleccion) {
		const name =
			facets.drops.find((d) => d.slug === filters.coleccion)?.name ??
			filters.coleccion
		chips.push({
			key: 'coleccion',
			label: name,
			clear: { coleccion: null },
		})
	}

	if (filters.precioMin != null || filters.precioMax != null) {
		const lo = filters.precioMin != null ? formatPrice(filters.precioMin) : '0'
		const hi =
			filters.precioMax != null ? formatPrice(filters.precioMax) : '∞'
		chips.push({
			key: 'precio',
			label: `${lo} – ${hi}`,
			clear: { precioMin: null, precioMax: null },
		})
	}

	if (chips.length === 0) return null

	return (
		<div className="flex flex-wrap items-center gap-2">
			{chips.map((chip) => (
				<button
					key={chip.key}
					type="button"
					onClick={() => apply(chip.clear)}
					className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 border border-border bg-secondary font-mono text-[11px] uppercase tracking-wide transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<span className="normal-case tracking-normal">
						{chip.label}
					</span>
					<X className="w-3.5 h-3.5" aria-hidden="true" />
					<span className="sr-only">Quitar filtro {chip.label}</span>
				</button>
			))}
			{countActiveFilters(filters) > 0 && (
				<button
					type="button"
					onClick={onClearAll}
					className="h-8 px-3 font-mono text-[11px] font-bold uppercase tracking-widest text-primary-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					Limpiar filtros
				</button>
			)}
		</div>
	)
}
