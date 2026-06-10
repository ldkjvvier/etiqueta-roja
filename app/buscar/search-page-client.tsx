'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import type { ProductListResult } from '@/lib/services/products-server'
import type { SearchFacets } from '@/lib/services/products-server'
import {
	countActiveFilters,
	hasAnyFilter,
	type SearchSort,
} from '@/lib/search/filters'
import { useSearchFilters } from './use-search-filters'
import { SearchInput } from './_components/search-input'
import { SortSelect } from './_components/sort-select'
import { FilterControls } from './_components/filter-controls'
import { FilterSheet } from './_components/filter-sheet'
import { ActiveFilterChips } from './_components/active-filter-chips'
import { ResultsGrid } from './_components/results-grid'

interface Props {
	filtersKey: string
	initialResult: ProductListResult
	facets: SearchFacets
	pageSize: number
}

export function SearchPageClient({
	filtersKey,
	initialResult,
	facets,
	pageSize,
}: Props) {
	const { filters, apply, clearAll, isPending } = useSearchFilters()

	const setQuery = useCallback(
		(q: string) => apply({ q }),
		[apply],
	)
	const setSort = useCallback(
		(orden: SearchSort) => apply({ orden }),
		[apply],
	)

	const { totalCount } = initialResult
	const resultLabel =
		totalCount === 1 ? '1 resultado' : `${totalCount} resultados`

	const hasFilterFacets =
		facets.sizes.length > 0 ||
		facets.categories.length > 0 ||
		facets.drops.length > 0 ||
		facets.priceRange != null

	return (
		<main id="main-content" tabIndex={-1} className="flex-1">
			{/* Breadcrumb */}
			<div className="px-4 md:px-8 lg:px-12 pt-6 pb-4 border-b border-border">
				<nav aria-label="Breadcrumb">
					<ol className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
						<li>
							<Link
								href="/"
								className="hover:text-foreground transition-colors"
							>
								Inicio
							</Link>
						</li>
						<li aria-hidden="true" className="select-none">
							/
						</li>
						<li className="text-foreground" aria-current="page">
							Buscar
						</li>
					</ol>
				</nav>
			</div>

			{/* Buscador */}
			<div className="px-4 md:px-8 lg:px-12 pt-8 pb-6">
				<h1 className="sr-only">Buscar productos</h1>
				<div className="max-w-2xl">
					<SearchInput
						value={filters.q}
						onChange={setQuery}
						isPending={isPending}
					/>
				</div>
			</div>

			{/* Layout: sidebar (desktop) + resultados */}
			<div className="px-4 md:px-8 lg:px-12 pb-24 lg:pb-16">
				<div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10">
					{/* Sidebar sticky (desktop) */}
					{hasFilterFacets && (
						<aside
							className="hidden lg:block"
							aria-label="Filtros"
						>
							<div className="sticky top-24">
								<div className="flex items-center justify-between mb-2">
									<h2 className="font-mono text-xs font-bold uppercase tracking-widest">
										Filtros
									</h2>
									{countActiveFilters(filters) > 0 && (
										<button
											type="button"
											onClick={clearAll}
											className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											Limpiar
										</button>
									)}
								</div>
								<FilterControls
									filters={filters}
									facets={facets}
									apply={apply}
								/>
							</div>
						</aside>
					)}

					{/* Columna de resultados */}
					<section
						aria-label="Resultados de búsqueda"
						className="min-w-0"
					>
						{/* Toolbar: contador + orden */}
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
							<p
								className="font-mono text-xs uppercase tracking-widest text-muted-foreground tabular-nums"
								aria-live="polite"
								role="status"
							>
								{filters.q ? (
									<>
										{resultLabel} para{' '}
										<span className="text-foreground">
											&ldquo;{filters.q}&rdquo;
										</span>
									</>
								) : (
									resultLabel
								)}
							</p>
							<SortSelect value={filters.orden} onChange={setSort} />
						</div>

						{/* Chips de filtros activos */}
						{hasAnyFilter(filters) && (
							<div className="mb-6">
								<ActiveFilterChips
									filters={filters}
									facets={facets}
									apply={apply}
									onClearAll={clearAll}
								/>
							</div>
						)}

						<ResultsGrid
							filtersKey={filtersKey}
							filters={filters}
							initialResult={initialResult}
							pageSize={pageSize}
							isPending={isPending}
						/>
					</section>
				</div>
			</div>

			{/* Filtros móvil (botón flotante + bottom-sheet) */}
			{hasFilterFacets && (
				<FilterSheet
					filters={filters}
					facets={facets}
					apply={apply}
					onClearAll={clearAll}
					resultLabel={resultLabel}
				/>
			)}
		</main>
	)
}
