'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/* Identidad nueva por cada pedido de foco: re-seleccionar una talla cuya foto
   ya estuvo enfocada debe volver a desplazar la galería hacia esa imagen. */
export type GalleryFocusRequest = { index: number }

interface ProductGalleryProps {
	images: string[]
	productName: string
	isSoldOut: boolean
	isLowStock: boolean
	discountPercent: number | null
	focusRequest: GalleryFocusRequest | null
}

/**
 * Galería adaptable con un solo árbol DOM:
 * - Mobile: rail horizontal con scroll-snap nativo (swipe, sin JS de carrusel),
 *   peek de la siguiente imagen como affordance y contador "01 / 04".
 * - Desktop: mosaico editorial de 2 columnas — todas las fotos visibles sin
 *   clicks; si la cantidad es impar la primera ocupa el ancho completo.
 * - 1 sola imagen: tile único compacto, sin rail ni contador.
 * Las fotos vienen sobre fondo blanco/gris del set: bg-product-surface +
 * object-cover funde la foto con el tile sin costuras.
 */
export function ProductGallery({
	images,
	productName,
	isSoldOut,
	isLowStock,
	discountPercent,
	focusRequest,
}: ProductGalleryProps) {
	const railRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<Array<HTMLDivElement | null>>([])
	const frameRef = useRef<number | null>(null)
	const [activeIndex, setActiveIndex] = useState(0)

	const count = images.length
	const isSingle = count === 1
	// Mosaico desktop: con cantidad impar la primera imagen es hero (2 cols)
	// y el resto cierra en pares — nunca queda un hueco en la grilla.
	const heroFirst = !isSingle && count % 2 === 1

	// Contador mobile: índice según posición de scroll del rail
	const handleScroll = useCallback(() => {
		const rail = railRef.current
		if (!rail || rail.scrollWidth <= rail.clientWidth) return
		if (frameRef.current) cancelAnimationFrame(frameRef.current)
		frameRef.current = requestAnimationFrame(() => {
			const slide = rail.firstElementChild as HTMLElement | null
			if (!slide) return
			const stride = slide.offsetWidth + 8 // gap-2
			const index = Math.round(rail.scrollLeft / stride)
			setActiveIndex(Math.min(count - 1, Math.max(0, index)))
		})
	}, [count])

	useEffect(() => {
		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current)
		}
	}, [])

	// Foco por variante: scrollIntoView funciona en ambos layouts — desplaza
	// el rail horizontal en mobile y la página hacia el tile en desktop.
	useEffect(() => {
		if (!focusRequest) return
		const el = itemRefs.current[focusRequest.index]
		if (!el) return
		const prefersReduced = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches
		el.scrollIntoView({
			behavior: prefersReduced ? 'auto' : 'smooth',
			block: 'nearest',
			inline: 'center',
		})
	}, [focusRequest])

	const badges = (
		<>
			{isLowStock && !isSoldOut && (
				<span className="absolute left-3 top-3 z-10 bg-background/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-primary-strong">
					ÚLTIMO
				</span>
			)}
			{isSoldOut && (
				<span className="absolute left-3 top-3 z-10 bg-foreground px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-background">
					AGOTADO
				</span>
			)}
			{discountPercent && !isSoldOut && (
				<span className="absolute right-3 top-3 z-10 bg-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground">
					-{discountPercent}%
				</span>
			)}
		</>
	)

	if (isSingle) {
		return (
			<div className="relative mx-auto w-full max-w-[52vh]">
				<div className="relative aspect-4/5 overflow-hidden bg-product-surface">
					<Image
						src={images[0] || '/placeholder.svg'}
						alt={productName}
						fill
						priority
						sizes="(max-width: 1024px) 100vw, 45vw"
						className={cn(
							'object-cover',
							isSoldOut && 'opacity-50 grayscale',
						)}
					/>
					{badges}
				</div>
			</div>
		)
	}

	return (
		<div className="relative">
			<div
				ref={railRef}
				onScroll={handleScroll}
				tabIndex={0}
				role="group"
				aria-label={`Imágenes de ${productName}: ${count} fotos. Desliza para ver más.`}
				className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:grid lg:grid-cols-2 lg:snap-none lg:overflow-visible"
			>
				{images.map((img, index) => (
					<div
						key={index}
						ref={(el) => {
							itemRefs.current[index] = el
						}}
						className={cn(
							// Mobile: slide al 78% para que asome la siguiente (affordance de swipe)
							'relative aspect-4/5 w-[78%] shrink-0 snap-center overflow-hidden bg-product-surface lg:w-auto',
							heroFirst && index === 0 && 'lg:col-span-2',
						)}
					>
						<Image
							src={img || '/placeholder.svg'}
							alt={`${productName} — vista ${index + 1} de ${count}`}
							fill
							priority={index === 0}
							loading={index === 0 ? undefined : 'lazy'}
							sizes={
								heroFirst && index === 0
									? '(max-width: 1024px) 78vw, 55vw'
									: '(max-width: 1024px) 78vw, 28vw'
							}
							className={cn(
								'object-cover',
								isSoldOut && 'opacity-50 grayscale',
							)}
						/>
						{index === 0 && badges}
					</div>
				))}
			</div>

			{/* Contador — solo tiene sentido en el rail mobile */}
			<span
				className="absolute bottom-3 right-3 z-10 bg-background/90 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.2em] lg:hidden"
				aria-hidden="true"
			>
				{String(activeIndex + 1).padStart(2, '0')} /{' '}
				{String(count).padStart(2, '0')}
			</span>
			<div
				aria-live="polite"
				aria-atomic="true"
				className="sr-only lg:hidden"
			>
				{`Imagen ${activeIndex + 1} de ${count}`}
			</div>
		</div>
	)
}
