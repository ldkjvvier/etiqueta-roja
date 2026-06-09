'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

interface ProductCardCarouselProps {
	images: string[]
	alt: string
	isSoldOut?: boolean
}

export function ProductCardCarousel({
	images,
	alt,
	isSoldOut = false,
}: ProductCardCarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: true,
		dragFree: false,
	})
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
	const [progress, setProgress] = useState(0)

	const onSelect = useCallback(() => {
		if (!emblaApi) return
		setSelectedIndex(emblaApi.selectedScrollSnap())
	}, [emblaApi])

	// Posición continua del carrusel (0–1). Alimenta el relleno por segmento.
	const onScroll = useCallback(() => {
		if (!emblaApi) return
		setProgress(emblaApi.scrollProgress())
	}, [emblaApi])

	useEffect(() => {
		if (!emblaApi) return
		setScrollSnaps(emblaApi.scrollSnapList())
		onSelect()
		onScroll()
		emblaApi.on('select', onSelect)
		emblaApi.on('scroll', onScroll)
		emblaApi.on('reInit', onSelect)
		emblaApi.on('reInit', onScroll)
		return () => {
			emblaApi.off('select', onSelect)
			emblaApi.off('scroll', onScroll)
			emblaApi.off('reInit', onSelect)
			emblaApi.off('reInit', onScroll)
		}
	}, [emblaApi, onSelect, onScroll])

	// Relleno 0–1 de cada segmento: crossfade según la distancia de arrastre
	// al snap correspondiente. En reposo da 1 para el activo y 0 para el resto.
	const segmentFill = (index: number) => {
		if (scrollSnaps.length < 2) return index === selectedIndex ? 1 : 0
		const step = Math.abs(scrollSnaps[1] - scrollSnaps[0]) || 1
		const distance = Math.abs(progress - scrollSnaps[index]) / step
		return Math.max(0, Math.min(1, 1 - distance))
	}

	const showIndicator = images.length > 1 && !isSoldOut

	return (
		<div className="relative w-full h-full group/carousel">
			{/* Carousel Container — navegación por swipe (gesto natural en mobile) */}
			<div ref={emblaRef} className="overflow-hidden w-full h-full">
				<div className="flex h-full">
					{images.map((img, index) => (
						<div
							key={index}
							className="relative flex-[0_0_100%] min-w-0 h-full"
						>
							<Image
								src={img || '/placeholder.svg'}
								alt={`${alt} - vista ${index + 1}`}
								fill
								sizes="(max-width: 1024px) 50vw, 25vw"
								className={`object-cover ${
									isSoldOut ? 'grayscale brightness-95' : ''
								}`}
								draggable={false}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Scrim sutil: garantiza legibilidad del indicador sobre fotos oscuras */}
			{showIndicator && (
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent z-[5]" />
			)}

			{/* Barra segmentada — cada segmento es un hit-target de 44px (tap-para-saltar + swipe).
			    El relleno (scaleX) sigue el arrastre en tiempo real: solo anima transform. */}
			{showIndicator && (
				<div className="absolute inset-x-3 bottom-0 flex gap-1.5 z-10">
					{images.map((_, index) => (
						<button
							key={index}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								emblaApi?.scrollTo(index)
							}}
							className="group/seg flex-1 flex items-end h-11 pb-2.5 focus-visible:outline-none"
							aria-label={`Ir a la imagen ${index + 1}`}
							aria-current={selectedIndex === index ? true : undefined}
						>
							<span className="relative block w-full h-[3px] overflow-hidden bg-foreground/20 group-focus-visible/seg:ring-1 group-focus-visible/seg:ring-ring group-focus-visible/seg:ring-offset-1">
								<span
									className="absolute inset-y-0 left-0 w-full origin-left bg-foreground"
									style={{
										transform: `scaleX(${segmentFill(index)})`,
									}}
								/>
							</span>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
