'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import {
	ArrowLeft,
	MessageCircle,
	ChevronLeft,
	ChevronRight,
	Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore, type Product } from '@/lib/store-context'
import { ProductCard } from './product-card'
import { formatPrice } from '@/lib/utils'
import { ViewTracker } from '@/components/view-tracker'
import { toast } from 'sonner'
import { ProductStickyCtaMobile } from '@/components/product-detail-sticky-cta'
import { CollapsibleDescription } from '@/components/collapsible-description'

export function ProductDetail({
	product,
	relatedProducts = [],
}: {
	product: Product
	relatedProducts?: Product[]
}) {
	const [selectedSize, setSelectedSize] = useState<string | null>(
		null,
	)
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)
	const [canShare, setCanShare] = useState(false)

	useEffect(() => {
		setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
	}, [])
	const { addToCart, generateWhatsAppMessage, whatsappNumber } =
		useStore()

	// Main gallery carousel
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

	const isSoldOut = product.stockStatus === 'sold_out'

	const normalizeImageUrl = useCallback((url: string) => {
		try {
			const parsed = new URL(url)
			parsed.search = ''
			parsed.hash = ''
			return parsed.toString()
		} catch {
			return url
		}
	}, [])

	// Get product images or fallback
	// Combine main image + gallery + variant images so selecting size can focus its photo.
	const productImages = useMemo(() => {
		const variantImages = (product.variants || [])
			.map((variant) => variant.imageUrl)
			.filter((image): image is string => Boolean(image))

		const allImages = [
			product.image,
			...(product.images || []),
			...variantImages,
		]
		const validImages = allImages.filter((img): img is string =>
			Boolean(img),
		)

		const uniqueByNormalized = new Map<string, string>()
		for (const image of validImages) {
			const normalized = normalizeImageUrl(image)
			if (!uniqueByNormalized.has(normalized)) {
				uniqueByNormalized.set(normalized, image)
			}
		}

		const uniqueImages = Array.from(uniqueByNormalized.values())
		return uniqueImages.length > 0
			? uniqueImages
			: ['/placeholder.svg']
	}, [
		product.image,
		product.images,
		product.variants,
		normalizeImageUrl,
	])

	const selectedVariant = selectedSize
		? product.variants?.find(
				(variant) => variant.size === selectedSize,
			)
		: null
	const displayedPrice =
		selectedVariant?.price !== null &&
		selectedVariant?.price !== undefined
			? selectedVariant.price
			: product.price

	// Get recommended products (exclude current product)
	const recommendedProducts = relatedProducts

	const scrollTo = useCallback(
		(index: number) => {
			emblaApi?.scrollTo(index)
			setSelectedImageIndex(index)
		},
		[emblaApi],
	)

	const scrollPrev = useCallback(() => {
		emblaApi?.scrollPrev()
	}, [emblaApi])

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext()
	}, [emblaApi])

	const focusVariantImage = useCallback(
		(variantImageUrl?: string | null) => {
			if (!variantImageUrl) return

			const targetNormalized = normalizeImageUrl(variantImageUrl)
			const index = productImages.findIndex(
				(imageUrl) =>
					normalizeImageUrl(imageUrl) === targetNormalized,
			)

			if (index >= 0) {
				scrollTo(index)
			}
		},
		[normalizeImageUrl, productImages, scrollTo],
	)

	const handleToggleSize = useCallback(
		(size: string) => {
			if (selectedSize === size) {
				setSelectedSize(null)
				return
			}

			setSelectedSize(size)
			const variant = product.variants?.find(
				(item) => item.size === size,
			)
			focusVariantImage(variant?.imageUrl)
		},
		[focusVariantImage, product.variants, selectedSize],
	)

	useEffect(() => {
		if (!emblaApi) return
		const onSelect = () => {
			setSelectedImageIndex(emblaApi.selectedScrollSnap())
		}
		emblaApi.on('select', onSelect)
		return () => {
			emblaApi.off('select', onSelect)
		}
	}, [emblaApi])

	// A-03: auto-seleccionar si hay exactamente 1 talla disponible
	useEffect(() => {
		const availableSizes = product.sizes.filter((size) => {
			const variant = product.variants?.find((v) => v.size === size)
			return (
				!variant ||
				variant.trackInventory === false ||
				variant.stock > 0
			)
		})
		if (availableSizes.length === 1) {
			setSelectedSize(availableSizes[0])
		}
		// Solo al montar o cambiar de producto — product.sizes y variants son inmutables en SSR
	}, [product.id])

	const handleWhatsAppOrder = () => {
		if (!selectedSize || !whatsappNumber) return
		const url = generateWhatsAppMessage(product, selectedSize)
		const opened = window.open(url, '_blank')
		if (!opened) {
			toast('Abrí WhatsApp manualmente', {
				description:
					'Tu navegador bloqueó la ventana emergente.',
				action: {
					label: 'Abrir',
					onClick: () => {
						window.location.href = url
					},
				},
				duration: 8000,
			})
		}
	}

	const handleAddToCart = () => {
		if (!selectedSize) return

		const maxStock = selectedVariant?.stock ?? 0

		const unitPrice =
			selectedVariant?.price !== null &&
			selectedVariant?.price !== undefined
				? selectedVariant.price
				: product.price

		addToCart({
			id: product.id,
			name: product.name,
			price: unitPrice,
			size: selectedSize,
			variantId: selectedVariant?.id,
			combinationKey: selectedVariant?.combinationKey,
			image: selectedVariant?.imageUrl || product.image,
			maxStock,
		})
	}

	useEffect(() => {
		if (selectedImageIndex < productImages.length) return
		setSelectedImageIndex(0)
		emblaApi?.scrollTo(0)
	}, [selectedImageIndex, productImages.length, emblaApi])

	return (
		<div className="min-h-screen bg-background pb-20 lg:pb-0">
			<ViewTracker productId={product.id} />
			{/* Breadcrumbs */}
			<div className="container mx-auto px-4 py-4">
				<nav
					className="flex items-center gap-2 text-sm"
					aria-label="Breadcrumb"
				>
					<Link
						href="/"
						className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						<span>Inicio</span>
					</Link>
					<span className="text-muted-foreground">/</span>
					<Link
						href="/#stock"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						Stock
					</Link>
					<span className="text-muted-foreground">/</span>
					<span className="font-medium">{product.name}</span>
				</nav>
			</div>

			{/* Product Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
					{/* Main Gallery */}
					<div className="flex flex-col lg:flex-row gap-4 w-full">
						{/* Main Carousel */}
						<div className="relative aspect-square bg-secondary overflow-hidden group flex-1 order-1">
							<div ref={emblaRef} className="overflow-hidden h-full">
								<div className="flex h-full">
									{productImages.map((img, index) => (
										<div
											key={index}
											className="relative flex-[0_0_100%] min-w-0 h-full"
										>
											<Image
												src={img || '/placeholder.svg'}
												alt={`${product.name} - vista ${index + 1}`}
												fill
												priority={index === 0}
												sizes="(max-width: 1024px) 100vw, 50vw"
												className={`object-cover ${
													isSoldOut ? 'opacity-50 grayscale' : ''
												}`}
											/>
										</div>
									))}
								</div>
							</div>

							{/* Aria live para screen readers al navegar el carousel */}
							<div
								aria-live="polite"
								aria-atomic="true"
								className="sr-only"
							>
								{`Imagen ${selectedImageIndex + 1} de ${productImages.length}`}
							</div>

							{/* Navigation Arrows */}
							{productImages.length > 1 && (
								<>
									<button
										type="button"
										onClick={scrollPrev}
										className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-foreground bg-background/90 opacity-100 transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
										aria-label="Imagen anterior"
									>
										<ChevronLeft className="w-5 h-5" />
									</button>
									<button
										type="button"
										onClick={scrollNext}
										className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-foreground bg-background/90 opacity-100 transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
										aria-label="Siguiente imagen"
									>
										<ChevronRight className="w-5 h-5" />
									</button>
								</>
							)}

							{/* Stock Badge — mismo lenguaje visual que product-badge.tsx */}
							{product.stockStatus === 'low' && !isSoldOut && (
								<span className="absolute left-4 top-4 z-10 bg-background/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-primary-strong">
									ÚLTIMO
								</span>
							)}
							{isSoldOut && (
								<span className="absolute left-4 top-4 z-10 bg-foreground px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-background">
									AGOTADO
								</span>
							)}

							{/* Sale Badge */}
							{product.originalPrice && !isSoldOut && (
								<span className="absolute right-4 top-4 z-10 bg-background/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-primary-strong">
									OFERTA
								</span>
							)}
						</div>

						{/* Thumbnail Row/Column */}
						{productImages.length > 1 && (
							<div className="flex gap-2 lg:flex-col lg:w-24 order-2 lg:h-[calc(100%-0)] overflow-y-auto scrollbar-hide">
								{productImages.map((img, index) => (
									<button
										key={index}
										type="button"
										onClick={() => scrollTo(index)}
										aria-label={`Ver imagen ${index + 1} de ${productImages.length}`}
										aria-pressed={selectedImageIndex === index}
										className={`relative aspect-square bg-secondary overflow-hidden border-2 transition-colors shrink-0 ${
											selectedImageIndex === index
												? 'border-foreground'
												: 'border-transparent hover:border-muted-foreground'
										} ${
											// Mobile: fill available space equally. Desktop: Fixed width
											'flex-1 lg:flex-none lg:w-full'
										}`}
									>
										<Image
											src={img || '/placeholder.svg'}
											alt={`${product.name} — vista ${index + 1} de ${productImages.length}`}
											fill
											sizes="96px"
											className="object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product Info */}
					<div className="flex flex-col pt-2 w-full">
						<div className="flex items-start justify-between gap-3 mb-3">
							<h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase">
								{product.name}
							</h1>
							{canShare && (
								<button
									type="button"
									onClick={() => {
										navigator
											.share({
												title: product.name,
												text: `Mirá este ${product.name} en Etiqueta Roja`,
												url: window.location.href,
											})
											.catch(() => {})
									}}
									className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center border border-border transition-colors hover:border-foreground"
									aria-label="Compartir producto"
								>
									<Share2
										className="h-4 w-4"
										aria-hidden="true"
									/>
								</button>
							)}
						</div>

						<div className="flex items-center gap-3 mb-4">
							<span className="text-2xl md:text-3xl lg:text-4xl font-black">
								{formatPrice(displayedPrice)}
							</span>
							{product.originalPrice && (
								<span className="text-xl text-muted-foreground line-through">
									{formatPrice(product.originalPrice)}
								</span>
							)}
						</div>

						{/* Description */}
						{product.description?.trim() ? (
							<div className="mb-6">
								<h3 className="font-bold text-xs uppercase tracking-wide mb-2 text-muted-foreground">
									Descripción
								</h3>
								<CollapsibleDescription
									text={product.description}
								/>
							</div>
						) : null}

						{/* Bottom Actions Section */}
						<div className="mt-auto pt-8 lg:pt-0">
							{/* Size Selector */}
							{!isSoldOut && (
								<div className="mb-6">
									<h3
										id="size-selector-label"
										className="font-bold text-xs uppercase tracking-wide mb-3 text-muted-foreground"
									>
										Selecciona tu talla
									</h3>
									<div
										className="flex flex-wrap gap-3"
										role="group"
										aria-labelledby="size-selector-label"
									>
										{product.sizes.map((size) => {
											// Check individual variant stock
											const variant = product.variants?.find(
												(v) => v.size === size,
											)
											const isSizeSoldOut = variant
												? variant.trackInventory !== false &&
												  variant.stock <= 0
												: false

											return (
												<button
													key={size}
													type="button"
													disabled={isSizeSoldOut}
													onClick={() => handleToggleSize(size)}
													aria-pressed={selectedSize === size}
													aria-label={`Talla ${size}${isSizeSoldOut ? ' agotada' : ''}`}
													className={`w-14 h-12 text-sm font-bold border-2 transition-all relative ${
														selectedSize === size
															? 'bg-foreground text-background border-foreground'
															: isSizeSoldOut
																? 'bg-secondary text-muted-foreground border-transparent opacity-50 cursor-not-allowed line-through decoration-2'
																: 'bg-transparent text-foreground border-border hover:border-foreground'
													}`}
												>
													{size}
												</button>
											)
										})}
									</div>
								</div>
							)}

							{/* A-05: Copy de escasez — visible al seleccionar una talla con poco stock */}
							{selectedVariant &&
								selectedVariant.trackInventory !== false &&
								selectedVariant.stock > 0 &&
								selectedVariant.stock <=
									(selectedVariant.lowStockThreshold ?? 5) && (
								<p
									role="status"
									className="mb-4 font-mono text-xs uppercase tracking-widest text-primary"
								>
									{selectedVariant.stock === 1
										? 'Solo queda 1 unidad'
										: `Solo quedan ${selectedVariant.stock} unidades`}
								</p>
							)}

							{/* Actions */}
							<div className="space-y-4">
								{!isSoldOut ? (
									<>
										{/* WhatsApp Primary CTA */}
										<Button
											onClick={handleWhatsAppOrder}
											disabled={!selectedSize || !whatsappNumber}
											className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black text-base lg:text-lg py-6 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<MessageCircle className="h-5 w-5 lg:h-6 lg:w-6" />
											{!whatsappNumber
												? 'WHATSAPP NO DISPONIBLE'
												: selectedSize
													? 'PEDIR POR WHATSAPP'
													: 'SELECCIONA TU TALLA'}
										</Button>

										{/* Add to Cart Secondary */}
										<Button
											onClick={handleAddToCart}
											disabled={!selectedSize}
											variant="outline"
											className="w-full border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold py-4 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
										>
											{selectedSize
												? 'AGREGAR AL CARRITO'
												: 'ELIGE TU TALLA PRIMERO'}
										</Button>
									</>
								) : (
									<Button
										disabled
										className="w-full font-bold py-8 text-lg opacity-50 cursor-not-allowed"
									>
										AGOTADO
									</Button>
								)}
							</div>

							{/* Info Note */}
							{!isSoldOut && (
								<p className="text-xs text-muted-foreground text-center mt-4">
									Al hacer clic en "Pedir por WhatsApp" se abrirá una
									conversación con nuestro equipo para coordinar tu
									pedido.
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Recommended Products Section */}
			{recommendedProducts.length > 0 && (
				<section className="container mx-auto px-4 py-16 border-t border-border">
					<h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-8">
						BAJO EL RADAR // STOCK RELACIONADO
					</h2>

					{/* Horizontal scroll on mobile, 4 columns on desktop */}
					<div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible scrollbar-hide">
						{recommendedProducts.map((recProduct) => (
							<div
								key={recProduct.id}
								className="flex-none w-[260px] md:w-auto"
							>
								<ProductCard product={recProduct} />
							</div>
						))}
					</div>
				</section>
			)}

			{/* A-01: Sticky CTA — solo visible en mobile (lg:hidden en el componente) */}
			<ProductStickyCtaMobile
				price={displayedPrice}
				selectedSize={selectedSize}
				disabled={!selectedSize || !whatsappNumber}
				isSoldOut={isSoldOut}
				onWhatsApp={handleWhatsAppOrder}
			/>
		</div>
	)
}
