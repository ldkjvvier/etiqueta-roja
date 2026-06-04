'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ProductCard } from './product-card'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useStore, type Product } from '@/lib/store-context'

const PRODUCTS_PER_PAGE = 8

interface ProductGridProps {
	products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
	const { searchQuery, setSearchQuery } = useStore()
	const [currentPage, setCurrentPage] = useState(1)
	const [activeCategory, setActiveCategory] = useState('TODOS')
	const reduce = useReducedMotion()

	const categories = useMemo(() => {
		const cats = new Set<string>()
		for (const p of products) {
			if (p.category) cats.add(p.category.toUpperCase())
		}
		const sorted = Array.from(cats).sort()
		return sorted.length > 0 ? ['TODOS', ...sorted] : []
	}, [products])

	const filteredProducts = useMemo(() => {
		let filtered = products
		if (activeCategory !== 'TODOS') {
			filtered = filtered.filter(
				(p) => p.category?.toUpperCase() === activeCategory,
			)
		}
		const q = searchQuery.trim().toLowerCase()
		if (q) {
			filtered = filtered.filter((p) =>
				p.name.toLowerCase().includes(q),
			)
		}
		return filtered
	}, [searchQuery, products, activeCategory])

	useEffect(() => {
		setCurrentPage(1)
	}, [searchQuery, activeCategory])

	const totalPages = Math.max(
		1,
		Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
	)

	const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
	const currentProducts = filteredProducts.slice(
		startIndex,
		startIndex + PRODUCTS_PER_PAGE,
	)

	const handleLoadMore = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1)
		}
	}

	return (
		<section id="stock" className="py-24 border-b border-border">
			<div className="container mx-auto px-4">
				{/* Header */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
					<h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">
						STOCK
					</h2>
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
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
								type="search"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Buscar en stock…"
								className="w-full md:w-64 bg-transparent text-sm font-mono placeholder:text-muted-foreground focus:outline-none"
								autoComplete="off"
								enterKeyHint="search"
							/>
						</form>
						<span className="text-sm font-bold text-muted-foreground font-mono tabular-nums">
							{filteredProducts.length} PRODUCTOS
						</span>
					</div>
				</div>

				{/* Category tabs — T4 */}
				{categories.length > 1 && (
					<div
						role="tablist"
						aria-label="Categorías"
						className="flex border-b border-border mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						{categories.map((cat) => (
							<button
								key={cat}
								type="button"
								role="tab"
								aria-selected={activeCategory === cat}
								tabIndex={0}
								onClick={() => setActiveCategory(cat)}
								className={[
									'relative px-5 py-3 -mb-px',
									'text-xs font-bold tracking-widest whitespace-nowrap',
									'transition-colors duration-150',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
									activeCategory === cat
										? 'text-foreground'
										: 'text-muted-foreground hover:text-foreground',
								].join(' ')}
							>
								{cat}
								{activeCategory === cat && (
									<motion.span
										layoutId="cat-rule"
										className="absolute inset-x-0 -bottom-px h-[3px] bg-primary"
										transition={
											reduce
												? { duration: 0 }
												: {
														type: 'spring',
														stiffness: 600,
														damping: 45,
												  }
										}
									/>
								)}
							</button>
						))}
					</div>
				)}

				{filteredProducts.length === 0 ? (
					<div className="border border-border p-12 text-center">
						<p className="font-bold uppercase tracking-wide">
							{searchQuery.trim()
								? 'Sin resultados'
								: activeCategory !== 'TODOS'
									? `Sin productos en ${activeCategory}`
									: 'Sin productos disponibles'}
						</p>
						{searchQuery.trim() && (
							<p className="mt-2 text-sm text-muted-foreground">
								Probá con otro término.
							</p>
						)}
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
						{currentProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}

				{filteredProducts.length > 0 && (
					<div className="mt-12 flex flex-col items-center gap-6">
						{/* Desktop pagination — T5 */}
						<nav
							aria-label="Paginación de productos"
							className="hidden md:flex items-center gap-2"
						>
							<button
								onClick={() =>
									setCurrentPage(Math.max(1, currentPage - 1))
								}
								disabled={currentPage === 1}
								aria-label="Página anterior"
								className="w-10 h-10 border border-foreground flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<ChevronLeft className="w-4 h-4" aria-hidden="true" />
							</button>

							{Array.from(
								{ length: totalPages },
								(_, i) => i + 1,
							).map((page) => (
								<button
									key={page}
									onClick={() => setCurrentPage(page)}
									aria-label={`Ir a la página ${page}`}
									aria-current={currentPage === page ? 'page' : undefined}
									className={[
										'w-10 h-10 border font-mono font-bold text-sm tabular-nums transition-colors',
										'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
										currentPage === page
											? 'bg-foreground text-background border-foreground'
											: 'border-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground',
									].join(' ')}
								>
									{page.toString().padStart(2, '0')}
								</button>
							))}

							<button
								onClick={() =>
									setCurrentPage(
										Math.min(totalPages, currentPage + 1),
									)
								}
								disabled={currentPage === totalPages}
								aria-label="Página siguiente"
								className="w-10 h-10 border border-foreground flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<ChevronRight className="w-4 h-4" aria-hidden="true" />
							</button>
						</nav>

						{/* Mobile: Load More */}
						{currentPage < totalPages && (
							<button
								onClick={handleLoadMore}
								className="w-full md:hidden border-2 border-foreground py-4 font-black text-sm uppercase tracking-wider hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								CARGAR MÁS STOCK (+)
							</button>
						)}

						<span className="text-xs font-mono text-muted-foreground tabular-nums" aria-live="polite">
							PÁGINA {currentPage.toString().padStart(2, '0')} /{' '}
							{totalPages.toString().padStart(2, '0')}
						</span>
					</div>
				)}
			</div>
		</section>
	)
}
