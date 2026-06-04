'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
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
	const primary = images[0] || '/placeholder.svg'
	const secondary = images.length > 1 ? images[1] : null
	const hasSecondary = Boolean(secondary) && !isSoldOut

	return (
		<>
			{/* Desktop (md+): crossfade entre imagen 1 y 2 al hover.
			    Solo se anima opacity (compositor-friendly). motion-reduce desactiva la transición. */}
			<div className="relative w-full h-full hidden md:block">
				<Image
					src={primary}
					alt={alt}
					fill
					sizes="(max-width: 1280px) 33vw, 25vw"
					className={cn(
						'object-cover',
						isSoldOut && 'grayscale brightness-95',
					)}
				/>
				{hasSecondary && (
					<Image
						src={secondary!}
						alt={`${alt} — vista alternativa`}
						fill
						sizes="(max-width: 1280px) 33vw, 25vw"
						className="object-cover opacity-0 will-change-[opacity] transition-opacity duration-300 ease-out-expo group-hover/card:opacity-100 motion-reduce:transition-none"
					/>
				)}
			</div>

			{/* Mobile (<md): carrusel deslizable */}
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
