'use client'

import Link from 'next/link'
import { ProductCard } from './product-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGridProps {
	products: import('@/lib/store-context').Product[]
	currentPage: number
	totalPages: number
	totalCount: number
}

function buildPageUrl(page: number) {
	const params = new URLSearchParams()
	params.set('page', String(page))
	return `/?${params.toString()}`
}

function paginationRange(
	current: number,
	total: number,
): (number | '...')[] {
	if (total <= 7)
		return Array.from({ length: total }, (_, i) => i + 1)
	if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
	if (current >= total - 3)
		return [
			1,
			'...',
			total - 4,
			total - 3,
			total - 2,
			total - 1,
			total,
		]
	return [1, '...', current - 1, current, current + 1, '...', total]
}

export function ProductGrid({
	products,
	currentPage,
	totalPages,
}: ProductGridProps) {
	return (
		<section
			id="productos"
			className="pt-4 md:pt-8 lg:pt-12 pb-8 md:pb-12 lg:pb-16 border-b border-border"
		>
			<div className="px-4 md:px-8 lg:px-12">
				{products.length === 0 ? (
					<div className="border border-border p-12 text-center">
						<p className="font-bold uppercase tracking-wide">
							Sin productos disponibles
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-1 md:gap-x-1.5 gap-y-3 md:gap-y-4 lg:gap-y-5">
						{products.map((product) => (
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
								href={buildPageUrl(Math.max(1, currentPage - 1))}
								aria-label="Página anterior"
								aria-disabled={currentPage === 1}
								tabIndex={currentPage === 1 ? -1 : 0}
								className={[
									'w-11 h-11 border border-foreground',
									'flex items-center justify-center transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									currentPage === 1
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
								{currentPage.toString().padStart(2, '0')}
								<span className="mx-2 text-muted-foreground">·</span>
								{totalPages.toString().padStart(2, '0')}
							</span>

							<Link
								href={buildPageUrl(
									Math.min(totalPages, currentPage + 1),
								)}
								aria-label="Página siguiente"
								aria-disabled={currentPage === totalPages}
								tabIndex={currentPage === totalPages ? -1 : 0}
								className={[
									'w-11 h-11 border border-foreground',
									'flex items-center justify-center transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									currentPage === totalPages
										? 'opacity-25 pointer-events-none'
										: 'hover:bg-foreground hover:text-background active:scale-[0.97]',
								].join(' ')}
							>
								<ChevronRight
									className="w-5 h-5"
									aria-hidden="true"
								/>
							</Link>
						</div>

						{/* ── Desktop: prev / page numbers / next ── */}
						<div className="hidden md:flex items-center gap-1.5">
							<Link
								href={buildPageUrl(Math.max(1, currentPage - 1))}
								aria-label="Página anterior"
								aria-disabled={currentPage === 1}
								tabIndex={currentPage === 1 ? -1 : 0}
								className={[
									'w-11 h-11 border border-foreground',
									'flex items-center justify-center transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									currentPage === 1
										? 'opacity-25 pointer-events-none'
										: 'hover:bg-primary hover:border-primary hover:text-primary-foreground',
								].join(' ')}
							>
								<ChevronLeft className="w-4 h-4" aria-hidden="true" />
							</Link>

							{paginationRange(currentPage, totalPages).map(
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
											href={buildPageUrl(item as number)}
											aria-label={`Página ${item}`}
											aria-current={
												currentPage === item ? 'page' : undefined
											}
											className={[
												'w-11 h-11 border font-mono font-bold text-sm tabular-nums',
												'flex items-center justify-center transition-colors',
												'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
												currentPage === item
													? 'bg-foreground text-background border-foreground'
													: 'border-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground',
											].join(' ')}
										>
											{(item as number).toString().padStart(2, '0')}
										</Link>
									),
							)}

							<Link
								href={buildPageUrl(
									Math.min(totalPages, currentPage + 1),
								)}
								aria-label="Página siguiente"
								aria-disabled={currentPage === totalPages}
								tabIndex={currentPage === totalPages ? -1 : 0}
								className={[
									'w-11 h-11 border border-foreground',
									'flex items-center justify-center transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									currentPage === totalPages
										? 'opacity-25 pointer-events-none'
										: 'hover:bg-primary hover:border-primary hover:text-primary-foreground',
								].join(' ')}
							>
								<ChevronRight
									className="w-4 h-4"
									aria-hidden="true"
								/>
							</Link>
						</div>

						<span
							className="hidden md:block text-xs font-mono text-muted-foreground tabular-nums"
							aria-live="polite"
						>
							PÁGINA {currentPage.toString().padStart(2, '0')} /{' '}
							{totalPages.toString().padStart(2, '0')}
						</span>
					</nav>
				)}
			</div>
		</section>
	)
}
