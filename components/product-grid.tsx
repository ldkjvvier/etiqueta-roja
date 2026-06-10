'use client'

import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import type { Product } from '@/lib/store-context'
import { ProductCard } from './product-card'
import { ProductCardSkeleton } from './product-card-skeleton'
import { loadMoreProducts } from './product-feed-actions'

interface ProductGridProps {
	initialProducts: Product[]
	totalCount: number
	pageSize: number
}

type FeedStatus = 'idle' | 'loading' | 'error'

// Distancia anticipada para empezar a cargar antes de llegar al final (prefetch).
const PREFETCH_ROOT_MARGIN = '600px 0px'
// Tope del stagger para que un lote completo no tarde en revelarse.
const STAGGER_STEP_MS = 40
const STAGGER_MAX_MS = 240
// Primeras tarjetas above-the-fold: precargan su imagen principal (LCP).
const PRIORITY_COUNT = 4

export function ProductGrid({
	initialProducts,
	totalCount,
	pageSize,
}: ProductGridProps) {
	const [products, setProducts] = useState<Product[]>(initialProducts)
	const [page, setPage] = useState(1)
	const [count, setCount] = useState(totalCount)
	const [status, setStatus] = useState<FeedStatus>('idle')
	// Índice a partir del cual los items son "nuevos" y deben animar su entrada.
	// Arranca en el largo inicial → los items de SSR NO animan (evita jank/CLS inicial).
	const [animateFrom, setAnimateFrom] = useState(initialProducts.length)

	// Espejo en ref para leer el estado más reciente sin recrear callbacks.
	const productsRef = useRef(products)
	const isLoadingRef = useRef(false)
	const sentinelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		productsRef.current = products
	}, [products])

	const hasMore = products.length < count

	const loadMore = useCallback(async () => {
		// Guard anti-duplicados: ignora disparos solapados del observer.
		if (isLoadingRef.current || !hasMore) return
		isLoadingRef.current = true
		setStatus('loading')

		const nextPage = page + 1
		try {
			const res = await loadMoreProducts(nextPage)
			const current = productsRef.current
			const seen = new Set(current.map((p) => p.id))
			// Dedup por id: protege contra offsets inestables (inserción/borrado
			// entre lotes) que de otro modo repetirían productos.
			const additions = res.products.filter((p) => !seen.has(p.id))

			setAnimateFrom(current.length)
			setProducts([...current, ...additions])
			setPage(nextPage)
			setCount(res.totalCount)
			setStatus('idle')
		} catch {
			setStatus('error')
		} finally {
			isLoadingRef.current = false
		}
	}, [hasMore, page])

	// Observer del sentinel: precarga el siguiente lote antes de llegar al final.
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

	return (
		<section
			id="productos"
			className="pt-4 md:pt-8 lg:pt-12 pb-8 md:pb-12 lg:pb-16 border-b border-border"
		>
			<div className="px-4 md:px-8 lg:px-12">
				{products.length === 0 ? (
					<div className="border border-border p-12 text-center">
						<p className="font-bold uppercase tracking-wide">
							Sin productos disponibles
						</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 md:gap-x-3 gap-y-5 md:gap-y-6">
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
										<ProductCard
											product={product}
											priority={index < PRIORITY_COUNT}
										/>
									</div>
								)
							})}

							{/* Placeholders discretos mientras llega el lote (sin spinner).
							    Misma altura que la tarjeta → sin layout shift. */}
							{status === 'loading' &&
								Array.from({ length: pageSize }, (_, i) => (
									<ProductCardSkeleton key={`sk-${i}`} />
								))}
						</div>

						{/* Región para lectores de pantalla: anuncia el progreso del feed. */}
						<p className="sr-only" aria-live="polite" role="status">
							{`Mostrando ${products.length} de ${count} productos`}
						</p>

						{/* Sentinel de prefetch + control de fallback (teclado / sin JS / SR). */}
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
										{status === 'loading'
											? 'Cargando…'
											: 'Cargar más'}
									</button>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</section>
	)
}
