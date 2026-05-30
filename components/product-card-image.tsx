'use client'

import Image from 'next/image'
import { useReducedMotion } from 'motion/react'
import { ProductCardCarousel } from './product-card-carousel'

interface ProductCardImageProps {
	images: string[]
	alt: string
	isSoldOut: boolean
}

export function ProductCardImage({
	images,
	alt,
	isSoldOut,
}: ProductCardImageProps) {
	const reduce = useReducedMotion()
	const primary = images[0] || '/placeholder.svg'
	const secondary = images.length > 1 ? images[1] : null
	const hasSwap = Boolean(secondary) && !reduce && !isSoldOut

	return (
		<>
			{/* Desktop (md+): static first image, hover fades in second */}
			<div className="relative w-full h-full hidden md:block">
				<Image
					src={primary}
					alt={alt}
					fill
					sizes="(max-width: 1280px) 33vw, 25vw"
					className={[
						'object-cover',
						hasSwap
							? 'transition-opacity duration-500 group-hover/card:opacity-0'
							: '',
						isSoldOut ? 'grayscale' : '',
					]
						.filter(Boolean)
						.join(' ')}
				/>
				{hasSwap && (
					<Image
						src={secondary!}
						alt={`${alt} - vista alternativa`}
						fill
						sizes="(max-width: 1280px) 33vw, 25vw"
						className={`object-cover opacity-0 transition-opacity duration-500 group-hover/card:opacity-100`}
					/>
				)}
			</div>

			{/* Mobile (<md): swipeable carousel */}
			<div className="relative w-full h-full md:hidden">
				<ProductCardCarousel
					images={images}
					alt={alt}
					isSoldOut={isSoldOut}
				/>
			</div>
		</>
	)
}
