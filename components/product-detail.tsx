'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import {
	ArrowLeft,
	MessageCircle,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore, type Product } from '@/lib/store-context'
import { ProductCard } from './product-card'

export function ProductDetail({
	product,
	relatedProducts = [],
}: {
	product: Product
	relatedProducts?: Product[]
}) {
	const [selectedSize, setSelectedSize] = useState<string | null>(
		null
	)
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)
	const { addToCart, generateWhatsAppMessage } = useStore()

	// Main gallery carousel
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

	const isSoldOut = product.stockStatus === 'sold_out'

	// Get product images or fallback
	// Combine main image with gallery images, ensuring main image is first
	const allImages = [product.image, ...(product.images || [])]
	const validImages = allImages.filter((img) => !!img)
	// Remove duplicates (in case main image is also in gallery)
	const uniqueImages = Array.from(new Set(validImages))

	const productImages =
		uniqueImages.length > 0 ? uniqueImages : ['/placeholder.svg']

	// Get recommended products (exclude current product)
	const recommendedProducts = relatedProducts

	const scrollTo = useCallback(
		(index: number) => {
			emblaApi?.scrollTo(index)
			setSelectedImageIndex(index)
		},
		[emblaApi]
	)

	const scrollPrev = useCallback(() => {
		emblaApi?.scrollPrev()
	}, [emblaApi])

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext()
	}, [emblaApi])

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

	const handleWhatsAppOrder = () => {
		if (!selectedSize) return
		window.open(
			generateWhatsAppMessage(product, selectedSize),
			'_blank'
		)
	}

	const handleAddToCart = () => {
		if (!selectedSize) return
		addToCart({
			id: product.id,
			name: product.name,
			price: product.price,
			size: selectedSize,
			image: product.image,
		})
		setSelectedSize(null)
	}

	return (
		<div className="min-h-screen bg-background">
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
				<div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
					{/* Main Gallery */}
					<div className="space-y-4 w-full lg:max-w-150">
						{/* Main Carousel */}
						<div className="relative aspect-square bg-secondary overflow-hidden group">
							<div ref={emblaRef} className="overflow-hidden h-full">
								<div className="flex h-full">
									{productImages.map((img, index) => (
										<div
											key={index}
											className="flex-[0_0_100%] min-w-0 h-full"
										>
											<img
												src={img || '/placeholder.svg'}
												alt={`${product.name} - view ${index + 1}`}
												className={`w-full h-full object-cover ${
													isSoldOut ? 'opacity-50 grayscale' : ''
												}`}
											/>
										</div>
									))}
								</div>
							</div>

							{/* Navigation Arrows */}
							{productImages.length > 1 && (
								<>
									<button
										onClick={scrollPrev}
										className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 border border-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
										aria-label="Previous image"
									>
										<ChevronLeft className="w-5 h-5" />
									</button>
									<button
										onClick={scrollNext}
										className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 border border-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
										aria-label="Next image"
									>
										<ChevronRight className="w-5 h-5" />
									</button>
								</>
							)}

							{/* Stock Badge */}
							{product.stockStatus === 'low' && (
								<span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 uppercase tracking-wider z-10">
									Poco Stock
								</span>
							)}
							{isSoldOut && (
								<span className="absolute top-4 left-4 bg-foreground text-background text-sm font-bold px-4 py-2 uppercase tracking-wider z-10">
									Agotado
								</span>
							)}

							{/* Sale Badge */}
							{product.originalPrice && !isSoldOut && (
								<span className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 z-10">
									OFERTA
								</span>
							)}
						</div>

						{/* Thumbnail Row */}
						{productImages.length > 1 && (
							<div className="flex gap-2">
								{productImages.map((img, index) => (
									<button
										key={index}
										onClick={() => scrollTo(index)}
										className={`flex-1 aspect-square bg-secondary overflow-hidden border-2 transition-colors ${
											selectedImageIndex === index
												? 'border-foreground'
												: 'border-transparent hover:border-muted-foreground'
										}`}
									>
										<img
											src={img || '/placeholder.svg'}
											alt={`${product.name} thumbnail ${index + 1}`}
											className="w-full h-full object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product Info */}
					<div className="flex flex-col pt-2">
						<h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase mb-3">
							{product.name}
						</h1>

						<div className="flex items-center gap-3 mb-4">
							<span className="text-2xl md:text-3xl lg:text-4xl font-black">
								${product.price}
							</span>
							{product.originalPrice && (
								<span className="text-xl text-muted-foreground line-through">
									${product.originalPrice}
								</span>
							)}
						</div>

						{/* Description */}
						<div className="mb-6">
							<h3 className="font-bold text-xs uppercase tracking-wide mb-2 text-muted-foreground">
								Descripción
							</h3>
							<p className="text-foreground leading-relaxed">
								{product.description ||
									'Prenda premium de nuestra última colección. Fabricada con materiales de alta calidad para máxima comodidad y durabilidad. Corte moderno oversize que define el streetwear contemporáneo.'}
							</p>
						</div>

						{/* Size Selector */}
						{!isSoldOut && (
							<div className="mb-6 mt-24">
								<h3 className="font-bold text-xs uppercase tracking-wide mb-3 text-muted-foreground">
									Selecciona tu talla
								</h3>
								<div className="flex flex-wrap gap-3">
									{product.sizes.map((size) => (
										<button
											key={size}
											onClick={() => setSelectedSize(size)}
											className={`w-14 h-12 text-sm font-bold border-2 transition-all ${
												selectedSize === size
													? 'bg-foreground text-background border-foreground'
													: 'bg-transparent text-foreground border-border hover:border-foreground'
											}`}
										>
											{size}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Actions */}
						<div className="space-y-4 mt-auto">
							{!isSoldOut ? (
								<>
									{/* WhatsApp Primary CTA */}
									<Button
										onClick={handleWhatsAppOrder}
										disabled={!selectedSize}
										className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black text-base lg:text-lg py-6 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<MessageCircle className="h-5 w-5 lg:h-6 lg:w-6" />
										{selectedSize
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
										AGREGAR AL CARRITO
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

			{/* Recommended Products Section */}
			<section className="container mx-auto px-4 py-16 border-t border-border">
				<h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-8">
					BAJO EL RADAR // STOCK RELACIONADO
				</h2>

				{/* Horizontal scroll on mobile, 4 columns on desktop */}
				<div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible scrollbar-hide">
					{recommendedProducts.map((recProduct) => (
						<div
							key={recProduct.id}
							className="flex-none w-65 md:w-auto"
						>
							<ProductCard product={recProduct} />
						</div>
					))}
				</div>
			</section>
		</div>
	)
}
