'use client'

import Link from 'next/link'
import type { Product } from '@/lib/store-context'
import { ProductCardImage } from './product-card-image'
import { ProductBadge, type BadgeKind } from './product-badge'
import { formatPrice, cn } from '@/lib/utils'

export type { Product } from '@/lib/store-context'

function getBadgeKind(product: Product): BadgeKind | null {
	if (product.stockStatus === 'sold_out') return null
	if (product.stockStatus === 'low') return 'low_stock'
	if (product.originalPrice) return 'offer'
	return null
}

export function ProductCard({ product }: { product: Product }) {
	const isSoldOut = product.stockStatus === 'sold_out'
	const badgeKind = getBadgeKind(product)
	const hasOffer = Boolean(product.originalPrice)

	const MAX_IMAGES = 2
	const allImages = [product.image, ...(product.images || [])]
	const uniqueImages = Array.from(new Set(allImages.filter(Boolean)))
	const cardImages =
		uniqueImages.length > 0
			? uniqueImages.slice(0, MAX_IMAGES)
			: ['/placeholder.svg']

	const imageSection = (
		// Tile sin borde. bg-product-surface = gris del set fotográfico (#eaeaea):
		// la foto (sobre gris) y el tile (mismo gris) se funden sin costura.
		<div className="relative aspect-4/5 bg-product-surface overflow-hidden">
			<ProductCardImage
				images={cardImages}
				alt={product.name}
				isSoldOut={isSoldOut}
			/>
			{/* Una sola etiqueta por prioridad: low_stock → offer */}
			{badgeKind && <ProductBadge kind={badgeKind} />}
			{/* AGOTADO limpio: overlay tenue + label horizontal (sin sello diagonal) */}
			{isSoldOut && (
				<div className="absolute inset-0 flex items-end justify-center bg-product-surface/30 pointer-events-none">
					<span className="mb-4 bg-background/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
						Agotado
					</span>
				</div>
			)}
		</div>
	)

	const infoSection = (
		// Sin padding lateral: el texto se alinea al borde del tile (estilo limpio).
		<div className="pt-3 space-y-1">
			<h3 className="font-medium text-xs md:text-sm uppercase tracking-wide line-clamp-2 leading-snug">
				{product.name}
			</h3>
			<div className="flex items-baseline gap-2 tabular-nums">
				<span
					className={cn(
						'font-mono font-semibold text-sm md:text-base',
						hasOffer && 'text-primary-strong', // precio de oferta en rojo (AA)
					)}
				>
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
			<div className="group/card block">
				{imageSection}
				{infoSection}
			</div>
		)
	}

	return (
		<Link
			href={product.slug ? `/producto/${product.slug}` : `/producto/${product.id}`}
			className={cn(
				'group/card block cursor-pointer',
				// Sin borde → el foco visible reemplaza la señal de interactividad del borde.
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
			)}
			aria-label={`Ver ${product.name}`}
		>
			{imageSection}
			{infoSection}
		</Link>
	)
}
