'use client'

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { ProductCard } from './product-card'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface ProductGridProps {
	products: import('@/lib/store-context').Product[]
	currentPage: number
	totalPages: number
	totalCount: number
	searchQuery: string
	allCategories: string[]
}

function buildPageUrl(page: number, q: string) {
	const params = new URLSearchParams()
	if (q) params.set('q', q)
	params.set('page', String(page))
	return `/?${params.toString()}`
}

export function ProductGrid({
	products,
	currentPage,
	totalPages,
	totalCount,
	searchQuery,
	allCategories,
}: ProductGridProps) {
	const [activeCategory, setActiveCategory] = useState('TODOS')
	const reduce = useReducedMotion()

	const categories =
		allCategories.length > 0 ? ['TODOS', ...allCategories] : []

	// Category filter runs client-side on the server-delivered page batch.
	const filteredProducts = useMemo(() => {
		if (activeCategory === 'TODOS') return products
		return products.filter(
			(p) => p.category?.toUpperCase() === activeCategory,
		)
	}, [products, activeCategory])

	return (
		<section id="stock" className="py-24 border-b border-border">
			<div className="container mx-auto px-4">
				{/* Header */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
					<h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">
						STOCK
					</h2>
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
						<form role="search" action="/" method="GET">
							<input type="hidden" name="page" value="1" />
							<div className="border border-border bg-background flex items-center gap-2 px-3 py-2">
								<label htmlFor="product-search" className="sr-only">
									Buscar productos
								</label>
								<Search
									className="h-4 w-4 text-muted-foreground"
									aria-hidden="true"
								/>
								<input
									id="product-search"
									name="q"
									type="search"
									defaultValue={searchQuery}
									placeholder="Buscar en stock…"
									className="w-full md:w-64 bg-transparent text-sm font-mono placeholder:text-muted-foreground focus:outline-none"
									autoComplete="off"
									enterKeyHint="search"
								/>
							</div>
						</form>
						<span className="text-sm font-bold text-muted-foreground font-mono tabular-nums">
							{totalCount} PRODUCTOS
						</span>
					</div>
				</div>

				{/* Category tabs */}
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
										className="absolute inset-x-0 -bottom-px h-0.75 bg-primary"
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
								Pruébalo con otro término de búsqueda o quita los
								filtros.
							</p>
						)}
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
						{filteredProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="mt-12 flex flex-col items-center gap-6">
						{/* Desktop pagination */}
						<nav
							aria-label="Paginación de productos"
							className="hidden md:flex items-center gap-2"
						>
							<Link
								href={buildPageUrl(
									Math.max(1, currentPage - 1),
									searchQuery,
								)}
								aria-label="Página anterior"
								aria-disabled={currentPage === 1}
								tabIndex={currentPage === 1 ? -1 : 0}
								className={[
									'w-10 h-10 border border-foreground flex items-center justify-center',
									'hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									currentPage === 1
										? 'opacity-30 pointer-events-none'
										: '',
								].join(' ')}
							>
								<ChevronLeft className="w-4 h-4" aria-hidden="true" />
							</Link>

							{Array.from(
								{ length: totalPages },
								(_, i) => i + 1,
							).map((page) => (
								<Link
									key={page}
									href={buildPageUrl(page, searchQuery)}
									aria-label={`Ir a la página ${page}`}
									aria-current={
										currentPage === page ? 'page' : undefined
									}
									className={[
										'w-10 h-10 border font-mono font-bold text-sm tabular-nums transition-colors',
										'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
										currentPage === page
											? 'bg-foreground text-background border-foreground'
											: 'border-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground',
									].join(' ')}
								>
									{page.toString().padStart(2, '0')}
								</Link>
							))}

							<Link
								href={buildPageUrl(
									Math.min(totalPages, currentPage + 1),
									searchQuery,
								)}
								aria-label="Página siguiente"
								aria-disabled={currentPage === totalPages}
								tabIndex={currentPage === totalPages ? -1 : 0}
								className={[
									'w-10 h-10 border border-foreground flex items-center justify-center',
									'hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									currentPage === totalPages
										? 'opacity-30 pointer-events-none'
										: '',
								].join(' ')}
							>
								<ChevronRight
									className="w-4 h-4"
									aria-hidden="true"
								/>
							</Link>
						</nav>

						{/* Mobile: Load More */}
						{currentPage < totalPages && (
							<Link
								href={buildPageUrl(currentPage + 1, searchQuery)}
								className="w-full md:hidden border-2 border-foreground py-4 font-black text-sm uppercase tracking-wider hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-center block"
							>
								CARGAR MÁS STOCK (+)
							</Link>
						)}

						<span
							className="text-xs font-mono text-muted-foreground tabular-nums"
							aria-live="polite"
						>
							PÁGINA {currentPage.toString().padStart(2, '0')} /{' '}
							{totalPages.toString().padStart(2, '0')}
						</span>
					</div>
				)}
			</div>
		</section>
	)
}
