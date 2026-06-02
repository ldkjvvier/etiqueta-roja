'use client'

import Link from 'next/link'
import type { Product } from '@/lib/store-context'
import { ProductCardImage } from './product-card-image'
import { CropMarks, Stamp } from '@/components/brand'
import { formatPrice } from '@/lib/utils'

export type { Product } from '@/lib/store-context'

export function ProductCard({ product }: { product: Product }) {
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
			{product.stockStatus === 'low' && <Stamp label="ÚLTIMO" />}
			{isSoldOut && <Stamp label="AGOTADO" />}
			{product.originalPrice && !isSoldOut && (
				<span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 z-20">
					OFERTA
				</span>
			)}
			{!isSoldOut && <CropMarks />}
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
			<div className="group/card border border-border bg-card">
				{imageSection}
				{infoSection}
			</div>
		)
	}

	return (
		<Link
			href={product.slug ? `/producto/${product.slug}` : `/producto/${product.id}`}
			className="group/card relative block border border-border bg-card cursor-pointer hover:z-10"
			aria-label={`Ver ${product.name}`}
		>
			{imageSection}
			{infoSection}
		</Link>
	)
}
