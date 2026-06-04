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

	const onSelect = useCallback(() => {
		if (!emblaApi) return
		setSelectedIndex(emblaApi.selectedScrollSnap())
	}, [emblaApi])

	useEffect(() => {
		if (!emblaApi) return
		onSelect()
		emblaApi.on('select', onSelect)
		return () => {
			emblaApi.off('select', onSelect)
		}
	}, [emblaApi, onSelect])

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

			{/* Dots — hit-target ≥44px con span visual interno de 6px */}
			{images.length > 1 && (
				<div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex z-10">
					{images.map((_, index) => (
						<button
							key={index}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								emblaApi?.scrollTo(index)
							}}
							className="flex items-center justify-center w-11 h-11 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							aria-label={`Ir a la imagen ${index + 1}`}
							aria-current={selectedIndex === index ? true : undefined}
						>
							<span
								className={`w-1.5 h-1.5 ${
									selectedIndex === index
										? 'bg-foreground'
										: 'bg-foreground/40'
								}`}
							/>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
