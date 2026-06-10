'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/store-context'
import type { ProductListResult } from '@/lib/services/products-server'
import type { SearchFilters } from '@/lib/search/filters'
import { loadMoreSearchAction } from '../actions'

interface Props {
	filtersKey: string
	filters: SearchFilters
	initialResult: ProductListResult
	pageSize: number
	isPending: boolean
}

const PREFETCH_ROOT_MARGIN = '600px 0px'
const STAGGER_STEP_MS = 40
const STAGGER_MAX_MS = 240

/** Skeleton con la misma altura exacta que ProductCard → sin layout shift. */
function CardSkeleton() {
	return (
		<div aria-hidden="true">
			<div className="relative aspect-4/5 bg-product-surface overflow-hidden">
				<div className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/40 to-transparent motion-safe:animate-skeleton-scan motion-reduce:hidden" />
			</div>
			<div className="pt-3 space-y-1">
				<div className="h-3.5 w-3/4 bg-secondary" />
				<div className="h-4 w-1/3 bg-secondary" />
			</div>
		</div>
	)
}

const GRID_CLASS =
	'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-1 md:gap-x-1.5 gap-y-3 md:gap-y-4 lg:gap-y-5'

export function ResultsGrid({
	filtersKey,
	filters,
	initialResult,
	pageSize,
	isPending,
}: Props) {
	const [additions, setAdditions] = useState<Product[]>([])
	const [page, setPage] = useState(1)
	const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

	// Al cambiar los filtros (nueva key) la página 1 llega por props desde el
	// servidor → reiniciamos la acumulación de "cargar más".
	useEffect(() => {
		setAdditions([])
		setPage(1)
		setStatus('idle')
	}, [filtersKey])

	const products = useMemo(() => {
		const seen = new Set<string>()
		const merged: Product[] = []
		for (const p of [...initialResult.products, ...additions]) {
			if (!seen.has(p.id)) {
				seen.add(p.id)
				merged.push(p)
			}
		}
		return merged
	}, [initialResult.products, additions])

	const animateFrom = initialResult.products.length
	const hasMore = products.length < initialResult.totalCount

	const isLoadingRef = useRef(false)
	const productsRef = useRef(products)
	useEffect(() => {
		productsRef.current = products
	}, [products])

	const sentinelRef = useRef<HTMLDivElement>(null)

	const loadMore = useCallback(async () => {
		if (isLoadingRef.current || !hasMore) return
		isLoadingRef.current = true
		setStatus('loading')
		const nextPage = page + 1
		try {
			const res = await loadMoreSearchAction(filters, nextPage)
			const current = productsRef.current
			const seen = new Set(current.map((p) => p.id))
			const fresh = res.products.filter((p) => !seen.has(p.id))
			setAdditions((prev) => [...prev, ...fresh])
			setPage(nextPage)
			setStatus('idle')
		} catch {
			setStatus('error')
		} finally {
			isLoadingRef.current = false
		}
	}, [hasMore, page, filters])

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !hasMore) return
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) loadMore()
			},
			{ rootMargin: PREFETCH_ROOT_MARGIN },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [hasMore, loadMore])

	// Estado de carga inicial sin resultados previos (primera navegación) →
	// skeletons en vez de espacio vacío.
	if (isPending && products.length === 0) {
		return (
			<div className={GRID_CLASS} aria-hidden="true">
				{Array.from({ length: pageSize }, (_, i) => (
					<CardSkeleton key={`sk-${i}`} />
				))}
			</div>
		)
	}

	if (products.length === 0) {
		return (
			<div className="border border-border p-12 text-center">
				<p className="font-bold uppercase tracking-wide text-sm">
					{filters.q
						? `Sin resultados para "${filters.q}"`
						: 'Sin productos para estos filtros'}
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					Probá ajustar o quitar algunos filtros.
				</p>
			</div>
		)
	}

	return (
		<div
			className={`transition-opacity duration-200 ${
				isPending
					? 'opacity-50 pointer-events-none'
					: 'opacity-100'
			}`}
		>
			<div className={GRID_CLASS}>
				{products.map((product, index) => {
					const isNew = index >= animateFrom
					return (
						<div
							key={product.id}
							className={
								isNew
									? 'motion-safe:animate-fade-in-up'
									: undefined
							}
							style={
								isNew
									? {
											animationDelay: `${Math.min(
												(index - animateFrom) *
													STAGGER_STEP_MS,
												STAGGER_MAX_MS,
											)}ms`,
										}
									: undefined
							}
						>
							<ProductCard product={product} />
						</div>
					)
				})}

				{status === 'loading' &&
					Array.from({ length: pageSize }, (_, i) => (
						<CardSkeleton key={`more-sk-${i}`} />
					))}
			</div>

			{hasMore && (
				<div className="mt-12 flex flex-col items-center gap-3">
					<div
						ref={sentinelRef}
						aria-hidden="true"
						className="h-px w-full"
					/>
					{status === 'error' ? (
						<div className="flex flex-col items-center gap-2 text-center">
							<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
								No se pudieron cargar más productos
							</p>
							<button
								type="button"
								onClick={loadMore}
								className="h-11 px-6 border border-foreground font-mono text-xs font-bold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								Reintentar
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={loadMore}
							disabled={status === 'loading'}
							aria-label="Cargar más productos"
							className="h-11 px-6 border border-foreground font-mono text-xs font-bold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
						>
							{status === 'loading' ? 'Cargando…' : 'Cargar más'}
						</button>
					)}
				</div>
			)}
		</div>
	)
}
