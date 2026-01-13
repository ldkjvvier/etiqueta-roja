'use client'

import Link from 'next/link'
import type { Product } from '@/lib/store-context'
import { ProductCardCarousel } from './product-card-carousel'

export type { Product } from '@/lib/store-context'

export function ProductCard({ product }: { product: Product }) {
	const isSoldOut = product.stockStatus === 'sold_out'

	const carouselImages =
		product.images && product.images.length > 0
			? product.images
			: [product.image, product.image, product.image]

	const className = `group border border-border bg-card ${
		!isSoldOut ? 'cursor-pointer' : ''
	} ${isSoldOut ? 'opacity-70' : ''}`

	const content = (
		<>
			<div className="relative aspect-square bg-secondary overflow-hidden">
				<ProductCardCarousel
					images={carouselImages}
					alt={product.name}
					isSoldOut={isSoldOut}
				/>

				{/* Stock Badge - High z-index to overlay carousel */}
				{product.stockStatus === 'low' && (
					<span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-20">
						Poco Stock
					</span>
				)}
				{isSoldOut && (
					<span className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-20">
						Agotado
					</span>
				)}

				{/* Sale Badge */}
				{product.originalPrice && !isSoldOut && (
					<span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 z-20">
						SALE
					</span>
				)}
			</div>

			{/* Info */}
			<div className="p-3 md:p-4">
				<h3 className="font-bold text-xs md:text-sm uppercase tracking-wide mb-2 line-clamp-1">
					{product.name}
				</h3>

				<div className="flex items-center gap-2 mb-3">
					<span className="font-black text-base md:text-lg">
						${product.price}
					</span>
					{product.originalPrice && (
						<span className="text-muted-foreground line-through text-xs md:text-sm">
							${product.originalPrice}
						</span>
					)}
				</div>

				{!isSoldOut && product.sizes.length > 0 && (
					<div className="flex flex-wrap gap-1 mb-2">
						{product.sizes.map((size) => (
							<span
								key={size}
								className="text-[10px] font-bold border border-border px-1.5 py-0.5 text-muted-foreground"
							>
								{size}
							</span>
						))}
					</div>
				)}

				{!isSoldOut ? (
					<p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wide">
						Ver detalles →
					</p>
				) : (
					<p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wide">
						Agotado
					</p>
				)}
			</div>
		</>
	)

	if (isSoldOut) {
		return <div className={className}>{content}</div>
	}

	return (
		<Link
			href={`/producto/${product.id}`}
			className={className}
			aria-label={`Ver detalles de ${product.name}`}
		>
			{content}
		</Link>
	)
}
