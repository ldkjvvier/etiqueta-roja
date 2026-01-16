'use client'

import type React from 'react'

import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

	const scrollPrev = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault() // Prevent navigation
			e.stopPropagation() // Prevent bubbling
			emblaApi?.scrollPrev()
		},
		[emblaApi]
	)

	const scrollNext = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault() // Prevent navigation
			e.stopPropagation() // Prevent bubbling
			emblaApi?.scrollNext()
		},
		[emblaApi]
	)

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
			{/* Carousel Container */}
			<div ref={emblaRef} className="overflow-hidden w-full h-full">
				<div className="flex h-full">
					{images.map((img, index) => (
						<div
							key={index}
							className="flex-[0_0_100%] min-w-0 h-full"
						>
							<img
								src={img || '/placeholder.svg'}
								alt={`${alt} - view ${index + 1}`}
								className={`w-full h-full object-cover ${
									isSoldOut ? 'grayscale' : ''
								}`}
								draggable={false}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Navigation Arrows - Sharp brutalist style */}
			<button
				onClick={scrollPrev}
				className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 md:w-7 md:h-7 bg-background/80 border border-foreground flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
				aria-label="Previous image"
			>
				<ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
			</button>
			<button
				onClick={scrollNext}
				className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 md:w-7 md:h-7 bg-background/80 border border-foreground flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
				aria-label="Next image"
			>
				<ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
			</button>

			{/* Square Indicator Dots */}
			{images.length > 1 && (
				<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
					{images.map((_, index) => (
						<button
							key={index}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								emblaApi?.scrollTo(index)
							}}
							className={`w-1.5 h-1.5 transition-colors ${
								selectedIndex === index
									? 'bg-foreground'
									: 'bg-foreground/40'
							}`}
							aria-label={`Go to image ${index + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	)
}
