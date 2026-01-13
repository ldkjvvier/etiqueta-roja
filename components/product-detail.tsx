'use client'

import { useState, useCallback, useEffect } from 'react'
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

// Recommended products data
const allProducts: Product[] = [
	{
		id: '1',
		name: 'Hoodie Oversize Negro',
		price: 89,
		image: '/black-oversized-streetwear-hoodie-front.jpg',
		images: [
			'/black-oversized-streetwear-hoodie-front.jpg',
			'/black-oversized-streetwear-hoodie-back.jpg',
			'/black-oversized-streetwear-hoodie-detail.jpg',
		],
		sizes: ['S', 'M', 'L', 'XL'],
		stockStatus: 'available',
		category: 'hoodies',
	},
	{
		id: '2',
		name: 'Camiseta Acid Wash',
		price: 45,
		originalPrice: 65,
		image: '/acid-wash-distressed-tshirt-front.jpg',
		images: [
			'/acid-wash-distressed-tshirt-front.jpg',
			'/acid-wash-distressed-tshirt-back.jpg',
			'/acid-wash-distressed-tshirt-detail-texture.jpg',
		],
		sizes: ['S', 'M', 'L'],
		stockStatus: 'low',
		category: 'tees',
	},
	{
		id: '3',
		name: 'Cargo Pants Wide Fit',
		price: 120,
		image: '/wide-fit-cargo-pants-streetwear-front.jpg',
		images: [
			'/wide-fit-cargo-pants-streetwear-front.jpg',
			'/wide-fit-cargo-pants-streetwear-back.jpg',
			'/wide-fit-cargo-pants-pocket-detail.jpg',
		],
		sizes: ['M', 'L', 'XL'],
		stockStatus: 'available',
		category: 'pants',
	},
	{
		id: '5',
		name: 'Beanie Logo Bordado',
		price: 35,
		image: '/black-beanie-embroidered-logo-front.jpg',
		images: [
			'/black-beanie-embroidered-logo-front.jpg',
			'/black-beanie-embroidered-logo-side.jpg',
			'/black-beanie-embroidered-logo-detail.jpg',
		],
		sizes: ['OS'],
		stockStatus: 'low',
		category: 'accessories',
	},
	{
		id: '7',
		name: 'Sudadera Cropped',
		price: 68,
		image: '/cropped-sweatshirt-streetwear-front.jpg',
		images: [
			'/cropped-sweatshirt-streetwear-front.jpg',
			'/cropped-sweatshirt-streetwear-back.jpg',
			'/cropped-sweatshirt-streetwear-detail.jpg',
		],
		sizes: ['XS', 'S', 'M'],
		stockStatus: 'available',
		category: 'hoodies',
	},
	{
		id: '10',
		name: 'Hoodie Graphic Print',
		price: 98,
		image: '/placeholder.svg?height=600&width=600',
		images: [
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
		],
		sizes: ['M', 'L'],
		stockStatus: 'low',
		category: 'hoodies',
	},
]

export function ProductDetail({ product }: { product: Product }) {
	const [selectedSize, setSelectedSize] = useState<string | null>(
		null
	)
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)
	const { setSelectedProduct, addToCart, generateWhatsAppMessage } =
		useStore()

	// Main gallery carousel
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

	const isSoldOut = product.stockStatus === 'sold_out'

	// Get product images or fallback
	const productImages =
		product.images?.length > 0
			? product.images
			: [product.image, product.image, product.image]

	// Get recommended products (exclude current product)
	const recommendedProducts = allProducts
		.filter(
			(p) => p.id !== product.id && p.stockStatus !== 'sold_out'
		)
		.slice(0, 4)

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
				<nav className="flex items-center gap-2 text-sm">
					<button
						onClick={() => setSelectedProduct(null)}
						className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						<span>Inicio</span>
					</button>
					<span className="text-muted-foreground">/</span>
					<span className="text-muted-foreground">Stock</span>
					<span className="text-muted-foreground">/</span>
					<span className="font-medium">{product.name}</span>
				</nav>
			</div>

			{/* Product Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Main Gallery */}
					<div className="space-y-4">
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
					</div>

					{/* Product Info */}
					<div className="flex flex-col">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-4">
							{product.name}
						</h1>

						<div className="flex items-center gap-3 mb-6">
							<span className="text-3xl md:text-4xl font-black">
								${product.price}
							</span>
							{product.originalPrice && (
								<span className="text-xl text-muted-foreground line-through">
									${product.originalPrice}
								</span>
							)}
						</div>

						{/* Description */}
						<div className="mb-8">
							<h3 className="font-bold text-sm uppercase tracking-wide mb-2 text-muted-foreground">
								Descripción
							</h3>
							<p className="text-foreground leading-relaxed">
								{product.description ||
									'Prenda premium de nuestra última colección. Fabricada con materiales de alta calidad para máxima comodidad y durabilidad. Corte moderno oversize que define el streetwear contemporáneo.'}
							</p>
						</div>

						{/* Size Selector */}
						{!isSoldOut && (
							<div className="mb-8">
								<h3 className="font-bold text-sm uppercase tracking-wide mb-3 text-muted-foreground">
									Selecciona tu talla
								</h3>
								<div className="flex flex-wrap gap-3">
									{product.sizes.map((size) => (
										<button
											key={size}
											onClick={() => setSelectedSize(size)}
											className={`min-w-[3.5rem] h-12 text-sm font-bold border-2 transition-all ${
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
										className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black text-lg py-8 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<MessageCircle className="h-6 w-6" />
										{selectedSize
											? 'PEDIR POR WHATSAPP'
											: 'SELECCIONA TU TALLA'}
									</Button>

									{/* Add to Cart Secondary */}
									<Button
										onClick={handleAddToCart}
										disabled={!selectedSize}
										variant="outline"
										className="w-full border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold py-6 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
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
							className="min-w-[260px] md:min-w-0"
						>
							<ProductCard product={recProduct} />
						</div>
					))}
				</div>
			</section>
		</div>
	)
}
