'use client'

import { useEffect, useMemo, useState } from 'react'
import { ProductCard, type Product } from './product-card'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useStore } from '@/lib/store-context'

const products: Product[] = [
	{
		id: '1',
		name: 'Hoodie Oversize Negro',
		price: 89,
		image: '/black-oversized-streetwear-hoodie.jpg',
		sizes: ['S', 'M', 'L', 'XL'],
		stockStatus: 'available',
	},
	{
		id: '2',
		name: 'Camiseta Acid Wash',
		price: 45,
		originalPrice: 65,
		image: '/acid-wash-distressed-tshirt.jpg',
		sizes: ['S', 'M', 'L'],
		stockStatus: 'low',
	},
	{
		id: '3',
		name: 'Cargo Pants Wide Fit',
		price: 120,
		image: '/wide-fit-cargo-pants-streetwear.jpg',
		sizes: ['M', 'L', 'XL'],
		stockStatus: 'available',
	},
	{
		id: '4',
		name: 'Bomber Jacket Vintage',
		price: 150,
		image: '/vintage-bomber-jacket-black.jpg',
		sizes: [],
		stockStatus: 'sold_out',
	},
	{
		id: '5',
		name: 'Beanie Logo Bordado',
		price: 35,
		image: '/black-beanie-embroidered-logo.jpg',
		sizes: ['OS'],
		stockStatus: 'low',
	},
	{
		id: '6',
		name: 'Joggers Essential',
		price: 75,
		originalPrice: 95,
		image: '/essential-joggers-streetwear-gray.jpg',
		sizes: ['S', 'M', 'L', 'XL'],
		stockStatus: 'available',
	},
	{
		id: '7',
		name: 'Sudadera Cropped',
		price: 68,
		image: '/cropped-sweatshirt-streetwear.jpg',
		sizes: ['XS', 'S', 'M'],
		stockStatus: 'available',
	},
	{
		id: '8',
		name: 'Pantalón Leather Effect',
		price: 110,
		image: '/leather-effect-pants-black.jpg',
		sizes: ['S', 'M'],
		stockStatus: 'low',
	},
	{
		id: '9',
		name: 'Tee Oversize Blanca',
		price: 42,
		image: '/white-oversized-tshirt-streetwear.jpg',
		sizes: ['S', 'M', 'L', 'XL', 'XXL'],
		stockStatus: 'available',
	},
	{
		id: '10',
		name: 'Hoodie Graphic Print',
		price: 98,
		image: '/graphic-print-hoodie-streetwear.jpg',
		sizes: ['M', 'L'],
		stockStatus: 'low',
	},
	{
		id: '11',
		name: 'Shorts Cargo Negro',
		price: 65,
		image: '/black-cargo-shorts-streetwear.jpg',
		sizes: [],
		stockStatus: 'sold_out',
	},
	{
		id: '12',
		name: 'Beanie Distressed',
		price: 38,
		originalPrice: 48,
		image: '/distressed-beanie-gray.jpg',
		sizes: ['OS'],
		stockStatus: 'available',
	},
]

const PRODUCTS_PER_PAGE = 8

export function ProductGrid() {
	const { searchQuery, setSearchQuery } = useStore()
	const [currentPage, setCurrentPage] = useState(1)

	const filteredProducts = useMemo(() => {
		const q = searchQuery.trim().toLowerCase()
		if (!q) return products
		return products.filter((p) => p.name.toLowerCase().includes(q))
	}, [searchQuery])

	const totalPages = Math.max(
		1,
		Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
	)

	useEffect(() => {
		setCurrentPage(1)
	}, [searchQuery])

	const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
	const currentProducts = filteredProducts.slice(
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
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
					<h2 className="text-3xl md:text-4xl font-black tracking-tight">
						STOCK
					</h2>
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-6">
						<form
							role="search"
							className="border border-border bg-background flex items-center gap-2 px-3 py-2"
						>
							<label htmlFor="product-search" className="sr-only">
								Buscar productos
							</label>
							<Search
								className="h-4 w-4 text-muted-foreground"
								aria-hidden="true"
							/>
							<input
								id="product-search"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Buscar en stock…"
								className="w-full md:w-64 bg-transparent text-sm font-mono placeholder:text-muted-foreground focus:outline-none"
								autoComplete="off"
								enterKeyHint="search"
							/>
						</form>
						<span className="text-sm font-bold text-muted-foreground font-mono">
							{filteredProducts.length} ITEMS
						</span>
					</div>
				</div>

				{filteredProducts.length === 0 ? (
					<div className="border border-border p-8 text-center">
						<p className="font-bold uppercase tracking-wide">
							No se encontraron productos
						</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Probá con otro término de búsqueda.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
						{currentProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}

				{filteredProducts.length > 0 && (
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

							{Array.from(
								{ length: totalPages },
								(_, i) => i + 1
							).map((page) => (
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
							))}

							<button
								onClick={() =>
									setCurrentPage(
										Math.min(totalPages, currentPage + 1)
									)
								}
								disabled={currentPage === totalPages}
								className="w-10 h-10 border border-foreground flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-foreground"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>

						{/* Mobile: Load More button */}
						{currentPage < totalPages && (
							<button
								onClick={handleLoadMore}
								className="w-full md:hidden border border-foreground py-4 font-black text-sm uppercase tracking-wider hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors"
							>
								LOAD MORE STOCK (+)
							</button>
						)}

						{/* Page indicator */}
						<span className="text-xs font-mono text-muted-foreground">
							PÁGINA {currentPage.toString().padStart(2, '0')} /{' '}
							{totalPages.toString().padStart(2, '0')}
						</span>
					</div>
				)}
			</div>
		</section>
	)
}
