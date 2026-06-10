'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
	ProductCardCarousel,
	CARD_IMAGE_SIZES,
} from './product-card-carousel'

interface ProductCardImageProps {
	images: string[]
	alt: string
	isSoldOut: boolean
	/** true para tarjetas above-the-fold: precarga la imagen principal (LCP). */
	priority?: boolean
	/** true tras el primer hover/focus de la tarjeta: recién ahí se monta la
	 *  imagen secundaria. Las tarjetas que nunca se tocan no la descargan. */
	warm?: boolean
}

export function ProductCardImage({
	images,
	alt,
	isSoldOut,
	priority = false,
	warm = false,
}: ProductCardImageProps) {
	// El crossfade espera al onLoad: evita que el hover muestre un frame vacío
	// mientras la secundaria (montada on-demand) todavía descarga.
	const [secondaryLoaded, setSecondaryLoaded] = useState(false)
	const primary = images[0] || '/placeholder.svg'
	const secondary = images.length > 1 ? images[1] : null
	const showSecondary = Boolean(secondary) && !isSoldOut && warm

	return (
		<>
			{/* Desktop (md+): crossfade entre imagen 1 y 2 al hover.
			    Solo se anima opacity/transform (compositor-friendly).
			    motion-reduce desactiva transición y zoom. */}
			<div className="relative hidden h-full w-full md:block">
				<Image
					src={primary}
					alt={alt}
					fill
					priority={priority}
					sizes={CARD_IMAGE_SIZES}
					className={cn(
						'object-cover will-change-transform transition-transform duration-500 ease-out-expo group-hover/card:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100',
						isSoldOut && 'grayscale brightness-95',
					)}
				/>
				{showSecondary && (
					<Image
						src={secondary!}
						alt=""
						aria-hidden="true"
						fill
						sizes={CARD_IMAGE_SIZES}
						onLoad={() => setSecondaryLoaded(true)}
						className={cn(
							'object-cover opacity-0 will-change-[opacity,transform] transition-[opacity,transform] duration-500 ease-out-expo group-hover/card:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100',
							secondaryLoaded && 'group-hover/card:opacity-100',
						)}
					/>
				)}
			</div>

			{/* Mobile (<md): carrusel deslizable */}
			<div className="relative h-full w-full md:hidden">
				<ProductCardCarousel
					images={images}
					alt={alt}
					isSoldOut={isSoldOut}
					priority={priority}
				/>
			</div>
		</>
	)
}
