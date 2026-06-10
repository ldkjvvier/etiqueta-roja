'use client'

import { useEffect, useId, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { formatPrice } from '@/lib/utils'
import type { SearchFacets } from '@/lib/services/products-server'
import type { SearchFilters } from '@/lib/search/filters'

interface Props {
	filters: SearchFilters
	facets: SearchFacets
	apply: (update: Partial<SearchFilters>) => void
}

function FilterGroup({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) {
	return (
		<div className="py-5 border-b border-border last:border-b-0">
			<h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
				{title}
			</h3>
			{children}
		</div>
	)
}

export function FilterControls({ filters, facets, apply }: Props) {
	function toggleSize(size: string) {
		const next = filters.tallas.includes(size)
			? filters.tallas.filter((s) => s !== size)
			: [...filters.tallas, size]
		apply({ tallas: next })
	}

	return (
		<div>
			{/* Disponibilidad */}
			<FilterGroup title="Disponibilidad">
				<label className="flex items-center justify-between gap-3 cursor-pointer">
					<span className="text-sm">Solo disponibles</span>
					<Switch
						checked={filters.disponible}
						onCheckedChange={(checked) =>
							apply({ disponible: checked })
						}
						aria-label="Mostrar solo productos disponibles"
					/>
				</label>
			</FilterGroup>

			{/* Tallas */}
			{facets.sizes.length > 0 && (
				<FilterGroup title="Talla">
					<div className="flex flex-wrap gap-2">
						{facets.sizes.map((size) => {
							const active = filters.tallas.includes(size)
							return (
								<button
									key={size}
									type="button"
									onClick={() => toggleSize(size)}
									aria-pressed={active}
									className={`min-w-11 h-11 px-3 border font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
										active
											? 'border-foreground bg-foreground text-background'
											: 'border-border hover:border-foreground'
									}`}
								>
									{size}
								</button>
							)
						})}
					</div>
				</FilterGroup>
			)}

			{/* Rango de precio */}
			{facets.priceRange && (
				<FilterGroup title="Precio">
					<PriceRange
						min={facets.priceRange.min}
						max={facets.priceRange.max}
						valueMin={filters.precioMin}
						valueMax={filters.precioMax}
						onCommit={(precioMin, precioMax) =>
							apply({ precioMin, precioMax })
						}
					/>
				</FilterGroup>
			)}

			{/* Categoría */}
			{facets.categories.length > 0 && (
				<FilterGroup title="Categoría">
					<ul className="space-y-1">
						{facets.categories.map((cat) => {
							const active = filters.categoria === cat.slug
							return (
								<li key={cat.slug}>
									<button
										type="button"
										onClick={() =>
											apply({
												categoria: active ? null : cat.slug,
											})
										}
										aria-pressed={active}
										className={`flex w-full items-center gap-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
											active
												? 'text-foreground font-medium'
												: 'text-muted-foreground hover:text-foreground'
										}`}
									>
										<span
											aria-hidden="true"
											className={`inline-block w-3 h-3 border ${
												active
													? 'border-foreground bg-foreground'
													: 'border-border'
											}`}
										/>
										{cat.name}
									</button>
								</li>
							)
						})}
					</ul>
				</FilterGroup>
			)}

			{/* Colección / drop */}
			{facets.drops.length > 0 && (
				<FilterGroup title="Colección">
					<ul className="space-y-1">
						{facets.drops.map((drop) => {
							const active = filters.coleccion === drop.slug
							return (
								<li key={drop.slug}>
									<button
										type="button"
										onClick={() =>
											apply({
												coleccion: active ? null : drop.slug,
											})
										}
										aria-pressed={active}
										className={`flex w-full items-center gap-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
											active
												? 'text-foreground font-medium'
												: 'text-muted-foreground hover:text-foreground'
										}`}
									>
										<span
											aria-hidden="true"
											className={`inline-block w-3 h-3 border ${
												active
													? 'border-foreground bg-foreground'
													: 'border-border'
											}`}
										/>
										{drop.name}
									</button>
								</li>
							)
						})}
					</ul>
				</FilterGroup>
			)}
		</div>
	)
}

// ── Rango de precio (sin Slider en el design system → dos inputs numéricos) ──
function PriceRange({
	min,
	max,
	valueMin,
	valueMax,
	onCommit,
}: {
	min: number
	max: number
	valueMin: number | null
	valueMax: number | null
	onCommit: (min: number | null, max: number | null) => void
}) {
	const minId = useId()
	const maxId = useId()
	const [localMin, setLocalMin] = useState(valueMin?.toString() ?? '')
	const [localMax, setLocalMax] = useState(valueMax?.toString() ?? '')

	// Re-sincroniza al cambiar la URL desde fuera (limpiar filtros, atrás).
	useEffect(() => {
		setLocalMin(valueMin?.toString() ?? '')
	}, [valueMin])
	useEffect(() => {
		setLocalMax(valueMax?.toString() ?? '')
	}, [valueMax])

	function commit() {
		const parsedMin = localMin === '' ? null : Number.parseInt(localMin, 10)
		const parsedMax = localMax === '' ? null : Number.parseInt(localMax, 10)
		onCommit(
			Number.isFinite(parsedMin as number) ? parsedMin : null,
			Number.isFinite(parsedMax as number) ? parsedMax : null,
		)
	}

	return (
		<div>
			<div className="flex items-center gap-2">
				<div className="flex-1">
					<label htmlFor={minId} className="sr-only">
						Precio mínimo
					</label>
					<input
						id={minId}
						type="number"
						inputMode="numeric"
						min={min}
						max={max}
						value={localMin}
						placeholder={String(min)}
						onChange={(e) => setLocalMin(e.target.value)}
						onBlur={commit}
						onKeyDown={(e) => {
							if (e.key === 'Enter') commit()
						}}
						className="w-full h-11 px-3 bg-secondary border border-border font-mono text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
				<span aria-hidden="true" className="text-muted-foreground">
					—
				</span>
				<div className="flex-1">
					<label htmlFor={maxId} className="sr-only">
						Precio máximo
					</label>
					<input
						id={maxId}
						type="number"
						inputMode="numeric"
						min={min}
						max={max}
						value={localMax}
						placeholder={String(max)}
						onChange={(e) => setLocalMax(e.target.value)}
						onBlur={commit}
						onKeyDown={(e) => {
							if (e.key === 'Enter') commit()
						}}
						className="w-full h-11 px-3 bg-secondary border border-border font-mono text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>
			<p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
				{formatPrice(min)} – {formatPrice(max)}
			</p>
		</div>
	)
}
