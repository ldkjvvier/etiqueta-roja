'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import type { Product } from '@/lib/store-context'
import { ProductCardImage } from './product-card-image'
import { formatPrice } from '@/lib/utils'

export type { Product } from '@/lib/store-context'

const MotionLink = motion(Link)

export function ProductCard({ product }: { product: Product }) {
	const reduce = useReducedMotion()
	const isSoldOut = product.stockStatus === 'sold_out'

	const MAX_IMAGES = 2
	const allImages = [product.image, ...(product.images || [])]
	const uniqueImages = Array.from(new Set(allImages.filter(Boolean)))
	const cardImages =
		uniqueImages.length > 0
			? uniqueImages.slice(0, MAX_IMAGES)
			: ['/placeholder.svg']

	const imageSection = (
		<div className="relative aspect-[4/5] bg-secondary overflow-hidden">
			<ProductCardImage
				images={cardImages}
				alt={product.name}
				isSoldOut={isSoldOut}
			/>

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
			{product.originalPrice && !isSoldOut && (
				<span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 z-20">
					OFERTA
				</span>
			)}
		</div>
	)

	const infoSection = (
		<div className="p-3 md:p-4 space-y-1.5">
			<h3 className="font-bold text-xs md:text-sm uppercase tracking-wide line-clamp-2 leading-snug">
				{product.name}
			</h3>
			<div className="flex items-baseline gap-2">
				<span className="font-mono font-bold text-sm md:text-base">
					{formatPrice(product.price)}
				</span>
				{product.originalPrice && (
					<span className="font-mono text-muted-foreground line-through text-xs">
						{formatPrice(product.originalPrice)}
					</span>
				)}
			</div>
		</div>
	)

	if (isSoldOut) {
		return (
			<div className="group/card border border-border bg-card opacity-70">
				{imageSection}
				{infoSection}
			</div>
		)
	}

	return (
		<MotionLink
			href={
				product.slug
					? `/producto/${product.slug}`
					: `/producto/${product.id}`
			}
			className="group/card relative block border border-border bg-card cursor-pointer hover:z-10"
			aria-label={`Ver ${product.name}`}
			whileHover={reduce ? undefined : { scale: 1.02 }}
			transition={
				reduce
					? undefined
					: { type: 'spring', stiffness: 300, damping: 25 }
			}
		>
			{imageSection}
			{infoSection}
		</MotionLink>
	)
}
