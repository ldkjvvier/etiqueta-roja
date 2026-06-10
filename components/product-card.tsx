'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/store-context'
import { ProductCardImage } from './product-card-image'
import { ProductBadge } from './product-badge'
import { formatPrice, cn } from '@/lib/utils'

export type { Product } from '@/lib/store-context'

const MAX_IMAGES = 2
const MAX_SIZES_SHOWN = 4

function getDiscountPct(product: Product): number | null {
	if (!product.originalPrice || product.originalPrice <= product.price)
		return null
	const pct = Math.round((1 - product.price / product.originalPrice) * 100)
	return pct > 0 ? pct : null
}

/** Tallas con stock real cuando hay variantes; si no, las declaradas. */
function getAvailableSizes(product: Product): string[] {
	if (product.variants?.length) {
		return product.variants
			.filter((v) => v.trackInventory === false || v.stock > 0)
			.map((v) => v.size)
	}
	return product.sizes ?? []
}

/**
 * Tarjeta de producto — concepto "etiqueta colgante":
 * tile de imagen fundido con el gris del set fotográfico (#eaeaea) + un tag
 * blanco de info unido por una línea perforada con muescas troqueladas.
 * El guiño rojo de la marca aparece en el punto de la meta, el % de oferta
 * y el barrido inferior al hover.
 */
export function ProductCard({
	product,
	priority = false,
}: {
	product: Product
	/** true para las primeras tarjetas del feed (above-the-fold → LCP). */
	priority?: boolean
}) {
	const isSoldOut = product.stockStatus === 'sold_out'
	const isLowStock = product.stockStatus === 'low'
	const hasOffer = Boolean(product.originalPrice)
	const discountPct = getDiscountPct(product)

	// La imagen secundaria del crossfade se monta recién al primer hover/focus:
	// las tarjetas que nunca se tocan no descargan su segunda foto.
	const [warm, setWarm] = useState(false)
	const warmUp = useCallback(() => setWarm(true), [])

	const allImages = [product.image, ...(product.images || [])]
	const uniqueImages = Array.from(new Set(allImages.filter(Boolean)))
	const cardImages =
		uniqueImages.length > 0
			? uniqueImages.slice(0, MAX_IMAGES)
			: ['/placeholder.svg']

	const sizes = isSoldOut ? [] : getAvailableSizes(product)
	const shownSizes = sizes.slice(0, MAX_SIZES_SHOWN)
	const hiddenSizes = sizes.length - shownSizes.length

	const inner = (
		<>
			{/* Tile de imagen — mismo gris que el set fotográfico: la foto y el
			    tile se funden sin costura. Sin borde inferior: la "unión" con el
			    tag es la línea perforada. */}
			<div className="relative aspect-4/5 overflow-hidden border border-b-0 border-border bg-product-surface">
				<ProductCardImage
					images={cardImages}
					alt={product.name}
					isSoldOut={isSoldOut}
					priority={priority}
					warm={warm}
				/>

				{/* Un solo sticker por prioridad: últimas unidades → % de oferta */}
				{!isSoldOut && isLowStock && <ProductBadge kind="low_stock" />}
				{!isSoldOut && !isLowStock && hasOffer && (
					<ProductBadge
						kind="offer"
						label={discountPct ? `−${discountPct}%` : undefined}
					/>
				)}

				{/* AGOTADO: overlay tenue + stub negro (estado por texto, no solo color) */}
				{isSoldOut && (
					<div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-product-surface/30">
						<span className="mb-4 bg-foreground px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background">
							Agotado
						</span>
					</div>
				)}
			</div>

			{/* Tag colgante: la info vive en una etiqueta blanca perforada. */}
			<div className="relative border border-t-0 border-border bg-card px-3 pb-3 pt-2.5">
				{/* Perforación + muescas troqueladas (decorativas) */}
				<span
					aria-hidden="true"
					className="absolute inset-x-2.5 top-0 border-t border-dashed border-border"
				/>
				<span
					aria-hidden="true"
					className="absolute top-0 -left-[5px] h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-background"
				/>
				<span
					aria-hidden="true"
					className="absolute top-0 -right-[5px] h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-background"
				/>

				{/* Meta: categoría + tallas disponibles (visibles sin hover) */}
				<div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
					<span className="flex min-w-0 items-center gap-1.5">
						<span
							aria-hidden="true"
							className="h-1.5 w-1.5 shrink-0 bg-primary"
						/>
						<span className="truncate">
							{product.category || 'Etiqueta Roja'}
						</span>
					</span>
					{shownSizes.length > 0 && (
						<span className="shrink-0">
							<span className="sr-only">Tallas disponibles: </span>
							{shownSizes.join('·')}
							{hiddenSizes > 0 && ` +${hiddenSizes}`}
						</span>
					)}
				</div>

				<h3
					className={cn(
						'mt-1.5 line-clamp-2 font-display text-xs font-semibold uppercase leading-snug tracking-wide md:text-sm',
						isSoldOut && 'text-muted-foreground',
					)}
				>
					{product.name}
				</h3>

				<div className="mt-1 flex items-baseline gap-2 font-mono tabular-nums">
					<span
						className={cn(
							'text-sm font-semibold md:text-base',
							hasOffer && !isSoldOut && 'text-primary-strong',
							isSoldOut && 'text-muted-foreground',
						)}
					>
						<span className="sr-only">Precio: </span>
						{formatPrice(product.price)}
					</span>
					{product.originalPrice && (
						<s className="text-xs text-muted-foreground">
							<span className="sr-only">Precio anterior: </span>
							{formatPrice(product.originalPrice)}
						</s>
					)}
				</div>

				{/* Barrido rojo inferior al hover/focus — solo transform (compositor) */}
				{!isSoldOut && (
					<span
						aria-hidden="true"
						className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out-expo group-hover/card:scale-x-100 group-focus-visible/card:scale-x-100 motion-reduce:transition-none"
					/>
				)}
			</div>
		</>
	)

	if (isSoldOut) {
		return <article className="group/card block">{inner}</article>
	}

	return (
		<Link
			href={
				product.slug
					? `/producto/${product.slug}`
					: `/producto/${product.id}`
			}
			aria-label={`${product.name}, ${formatPrice(product.price)}${
				product.originalPrice
					? `, en oferta, antes ${formatPrice(product.originalPrice)}`
					: ''
			}`}
			onPointerEnter={warmUp}
			onFocus={warmUp}
			className="group/card block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			{inner}
		</Link>
	)
}
