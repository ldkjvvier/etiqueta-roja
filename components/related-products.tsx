'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ProductCard } from './product-card'
import type { Product } from '@/lib/store-context'

// Tipo del API de embla sin depender directamente del paquete core
// (pnpm no lo expone como dependencia hoisted).
type EmblaApi = NonNullable<UseEmblaCarouselType[1]>

/**
 * Rail editorial de productos relacionados: cabecera con acento serif,
 * tarjetas numeradas estilo índice y controles prev/next en desktop.
 * En mobile se navega por drag (embla) con snap por tarjeta.
 */
export function RelatedProducts({ products }: { products: Product[] }) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: 'start',
		containScroll: 'trimSnaps',
	})
	const [canPrev, setCanPrev] = useState(false)
	const [canNext, setCanNext] = useState(false)

	const updateControls = useCallback((api: EmblaApi) => {
		setCanPrev(api.canScrollPrev())
		setCanNext(api.canScrollNext())
	}, [])

	useEffect(() => {
		if (!emblaApi) return
		updateControls(emblaApi)
		emblaApi.on('select', updateControls)
		emblaApi.on('reInit', updateControls)
		return () => {
			emblaApi.off('select', updateControls)
			emblaApi.off('reInit', updateControls)
		}
	}, [emblaApi, updateControls])

	if (products.length === 0) return null

	const total = String(products.length).padStart(2, '0')
	const hasOverflow = canPrev || canNext

	return (
		<section
			aria-label="Productos relacionados"
			className="container mx-auto px-4 py-14 lg:py-20"
		>
			{/* Cabecera editorial */}
			<header className="mb-8 flex items-end justify-between gap-4 lg:mb-10">
				<div>
					<p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary-strong">
						// Sigue mirando
					</p>
					<h2 className="font-editorial text-3xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-5xl">
						También en{' '}
						<span className="font-accent normal-case italic font-normal text-primary-strong">
							el radar
						</span>
					</h2>
				</div>

				{/* Controles — solo útiles cuando hay overflow */}
				{hasOverflow && (
					<div className="hidden items-center gap-2 md:flex">
						<button
							type="button"
							onClick={() => emblaApi?.scrollPrev()}
							disabled={!canPrev}
							aria-label="Productos anteriores"
							className="flex h-11 w-11 items-center justify-center border border-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							onClick={() => emblaApi?.scrollNext()}
							disabled={!canNext}
							aria-label="Más productos"
							className="flex h-11 w-11 items-center justify-center border border-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
						>
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				)}
			</header>

			{/* Rail con snap por tarjeta */}
			<div ref={emblaRef} className="overflow-hidden">
				<div className="flex touch-pan-y gap-4 md:gap-6">
					{products.map((product, index) => (
						<div
							key={product.id}
							className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_44%] lg:flex-[0_0_30%] xl:flex-[0_0_23%]"
						>
							{/* Índice editorial sobre cada tarjeta */}
							<div className="mb-3 flex items-baseline justify-between border-t-2 border-foreground pt-2 font-mono text-[10px] uppercase tracking-[0.2em]">
								<span className="font-bold">
									{String(index + 1).padStart(2, '0')}
									<span className="text-muted-foreground">/{total}</span>
								</span>
								{product.category && (
									<span className="truncate pl-3 text-muted-foreground">
										{product.category}
									</span>
								)}
							</div>
							<ProductCard product={product} />
						</div>
					))}
				</div>
			</div>

			{/* Salida al catálogo completo */}
			<div className="mt-10 flex justify-center">
				<Link
					href="/buscar"
					className="group inline-flex items-center gap-3 border-2 border-foreground px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					Ver todo el stock
					<ArrowRight
						className="h-4 w-4 transition-transform group-hover:translate-x-1"
						aria-hidden="true"
					/>
				</Link>
			</div>
		</section>
	)
}
