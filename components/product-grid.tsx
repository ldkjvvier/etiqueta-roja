'use client'

import { useState } from 'react'
import { ProductCard, type Product } from './product-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const products: Product[] = [
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
			'/placeholder.svg?height=600&width=600',
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
		id: '4',
		name: 'Bomber Jacket Vintage',
		price: 150,
		image: '/placeholder.svg?height=600&width=600',
		images: [
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
		],
		sizes: [],
		stockStatus: 'sold_out',
		category: 'jackets',
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
		id: '6',
		name: 'Joggers Essential',
		price: 75,
		originalPrice: 95,
		image: '/placeholder.svg?height=600&width=600',
		images: [
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
		],
		sizes: ['S', 'M', 'L', 'XL'],
		stockStatus: 'available',
		category: 'pants',
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
		id: '8',
		name: 'Pantalón Leather Effect',
		price: 110,
		image: '/placeholder.svg?height=600&width=600',
		images: [
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
		],
		sizes: ['S', 'M'],
		stockStatus: 'low',
		category: 'pants',
	},
	{
		id: '9',
		name: 'Tee Oversize Blanca',
		price: 42,
		image: '/placeholder.svg?height=600&width=600',
		images: [
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
		],
		sizes: ['S', 'M', 'L', 'XL', 'XXL'],
		stockStatus: 'available',
		category: 'tees',
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
	{
		id: '11',
		name: 'Shorts Cargo Negro',
		price: 65,
		image: '/placeholder.svg?height=600&width=600',
		images: [
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
		],
		sizes: [],
		stockStatus: 'sold_out',
		category: 'pants',
	},
	{
		id: '12',
		name: 'Beanie Distressed',
		price: 38,
		originalPrice: 48,
		image: '/placeholder.svg?height=600&width=600',
		images: [
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
			'/placeholder.svg?height=600&width=600',
		],
		sizes: ['OS'],
		stockStatus: 'available',
		category: 'accessories',
	},
]

const PRODUCTS_PER_PAGE = 8

export function ProductGrid() {
	const [currentPage, setCurrentPage] = useState(1)
	const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE)

	const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
	const currentProducts = products.slice(
		startIndex,
		startIndex + PRODUCTS_PER_PAGE
	)

	const handleLoadMore = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1)
		}
	}

	return (
		<section id="stock" className="py-16 border-b border-border">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-3xl md:text-4xl font-black tracking-tight">
						STOCK
					</h2>
					<span className="text-sm font-bold text-muted-foreground font-mono">
						{products.length} ITEMS
					</span>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
					{currentProducts.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>

				<div className="mt-12 flex flex-col items-center gap-6">
					{/* Desktop pagination numbers */}
					<div className="hidden md:flex items-center gap-2">
						<button
							onClick={() =>
								setCurrentPage(Math.max(1, currentPage - 1))
							}
							disabled={currentPage === 1}
							className="w-10 h-10 border border-foreground flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-foreground"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map(
							(page) => (
								<button
									key={page}
									onClick={() => setCurrentPage(page)}
									className={`w-10 h-10 border font-mono font-bold text-sm transition-colors ${
										currentPage === page
											? 'bg-foreground text-background border-foreground'
											: 'border-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground'
									}`}
								>
									{page.toString().padStart(2, '0')}
								</button>
							)
						)}

						<button
							onClick={() =>
								setCurrentPage(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages}
							className="w-10 h-10 border border-foreground flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-foreground"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>

					{/* Mobile: Load More button - brutalist full width */}
					{currentPage < totalPages && (
						<button
							onClick={handleLoadMore}
							className="w-full md:hidden border-2 border-foreground py-4 font-black text-sm uppercase tracking-wider hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors"
						>
							CARGAR MÁS STOCK (+)
						</button>
					)}

					{/* Page indicator */}
					<span className="text-xs font-mono text-muted-foreground">
						PÁGINA {currentPage.toString().padStart(2, '0')} /{' '}
						{totalPages.toString().padStart(2, '0')}
					</span>
				</div>
			</div>
		</section>
	)
}

// Export products for use in other components
export { products }
