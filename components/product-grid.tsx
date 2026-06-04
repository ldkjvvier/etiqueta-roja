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

function paginationRange(
	current: number,
	total: number,
): (number | '...')[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
	if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
	if (current >= total - 3)
		return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
	return [1, '...', current - 1, current, current + 1, '...', total]
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

	// When a category is active the pagination is meaningless (filter is local),
	// so clamp to 1/1 to disable all nav controls.
	const effectiveTotalPages = activeCategory !== 'TODOS' ? 1 : totalPages
	const effectiveCurrentPage = activeCategory !== 'TODOS' ? 1 : currentPage

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
					<nav
						aria-label="Paginación de productos"
						className="mt-12 flex flex-col items-center gap-4"
					>
						{/* ── Mobile: prev / counter / next ── */}
						<div className="flex items-center justify-center gap-4 w-full md:hidden">
							<Link
								href={buildPageUrl(
									Math.max(1, effectiveCurrentPage - 1),
									searchQuery,
								)}
								aria-label="Página anterior"
								aria-disabled={effectiveCurrentPage === 1}
								tabIndex={effectiveCurrentPage === 1 ? -1 : 0}
								className={[
									'w-11 h-11 border border-foreground',
									'flex items-center justify-center transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									effectiveCurrentPage === 1
										? 'opacity-25 pointer-events-none'
										: 'hover:bg-foreground hover:text-background active:scale-[0.97]',
								].join(' ')}
							>
								<ChevronLeft className="w-5 h-5" aria-hidden="true" />
							</Link>

							<span
								className="font-mono font-bold text-sm tabular-nums"
								aria-live="polite"
								aria-atomic="true"
							>
								{effectiveCurrentPage.toString().padStart(2, '0')}
								<span className="mx-2 text-muted-foreground">·</span>
								{effectiveTotalPages.toString().padStart(2, '0')}
							</span>

							<Link
								href={buildPageUrl(
									Math.min(effectiveTotalPages, effectiveCurrentPage + 1),
									searchQuery,
								)}
								aria-label="Página siguiente"
								aria-disabled={effectiveCurrentPage === effectiveTotalPages}
								tabIndex={effectiveCurrentPage === effectiveTotalPages ? -1 : 0}
								className={[
									'w-11 h-11 border border-foreground',
									'flex items-center justify-center transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									effectiveCurrentPage === effectiveTotalPages
										? 'opacity-25 pointer-events-none'
										: 'hover:bg-foreground hover:text-background active:scale-[0.97]',
								].join(' ')}
							>
								<ChevronRight className="w-5 h-5" aria-hidden="true" />
							</Link>
						</div>

						{/* ── Desktop: prev / page numbers / next ── */}
						<div className="hidden md:flex items-center gap-1.5">
							<Link
								href={buildPageUrl(
									Math.max(1, effectiveCurrentPage - 1),
									searchQuery,
								)}
								aria-label="Página anterior"
								aria-disabled={effectiveCurrentPage === 1}
								tabIndex={effectiveCurrentPage === 1 ? -1 : 0}
								className={[
									'w-11 h-11 border border-foreground',
									'flex items-center justify-center transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									effectiveCurrentPage === 1
										? 'opacity-25 pointer-events-none'
										: 'hover:bg-primary hover:border-primary hover:text-primary-foreground',
								].join(' ')}
							>
								<ChevronLeft className="w-4 h-4" aria-hidden="true" />
							</Link>

							{paginationRange(effectiveCurrentPage, effectiveTotalPages).map(
								(item, idx) =>
									item === '...' ? (
										<span
											key={`ellipsis-${idx}`}
											className="w-11 h-11 flex items-center justify-center text-muted-foreground font-mono text-sm select-none"
											aria-hidden="true"
										>
											…
										</span>
									) : (
										<Link
											key={item}
											href={buildPageUrl(
												item as number,
												searchQuery,
											)}
											aria-label={`Página ${item}`}
											aria-current={
												effectiveCurrentPage === item
													? 'page'
													: undefined
											}
											className={[
												'w-11 h-11 border font-mono font-bold text-sm tabular-nums',
												'flex items-center justify-center transition-colors',
												'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
												effectiveCurrentPage === item
													? 'bg-foreground text-background border-foreground'
													: 'border-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground',
											].join(' ')}
										>
											{(item as number)
												.toString()
												.padStart(2, '0')}
										</Link>
									),
							)}

							<Link
								href={buildPageUrl(
									Math.min(effectiveTotalPages, effectiveCurrentPage + 1),
									searchQuery,
								)}
								aria-label="Página siguiente"
								aria-disabled={effectiveCurrentPage === effectiveTotalPages}
								tabIndex={effectiveCurrentPage === effectiveTotalPages ? -1 : 0}
								className={[
									'w-11 h-11 border border-foreground',
									'flex items-center justify-center transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									effectiveCurrentPage === effectiveTotalPages
										? 'opacity-25 pointer-events-none'
										: 'hover:bg-primary hover:border-primary hover:text-primary-foreground',
								].join(' ')}
							>
								<ChevronRight className="w-4 h-4" aria-hidden="true" />
							</Link>
						</div>

						<span
							className="hidden md:block text-xs font-mono text-muted-foreground tabular-nums"
							aria-live="polite"
						>
							PÁGINA {effectiveCurrentPage.toString().padStart(2, '0')} /{' '}
							{effectiveTotalPages.toString().padStart(2, '0')}
						</span>
					</nav>
				)}
			</div>
		</section>
	)
}
