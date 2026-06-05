'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useDebounce } from '@/hooks/use-debounce'
import { ProductCard } from '@/components/product-card'
import { searchProductsAction } from './actions'
import type { ProductListResult } from '@/lib/services/products-server'

interface Props {
	initialQuery: string
	initialResults: ProductListResult
}

export function SearchPageClient({
	initialQuery,
	initialResults,
}: Props) {
	const router = useRouter()
	const inputRef = useRef<HTMLInputElement>(null)
	const isFirstRender = useRef(true)

	const [query, setQuery] = useState(initialQuery)
	const [results, setResults] = useState(initialResults)
	const [isPending, startTransition] = useTransition()

	const debouncedQuery = useDebounce(query, 350)

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}
		startTransition(async () => {
			const trimmed = debouncedQuery.trim()
			const params = new URLSearchParams()
			if (trimmed) params.set('q', trimmed)
			router.replace(
				`/buscar${trimmed ? `?${params.toString()}` : ''}`,
				{ scroll: false },
			)
			const data = await searchProductsAction(debouncedQuery)
			setResults(data)
		})
	}, [debouncedQuery])

	const { products, totalCount } = results

	const resultLabel =
		totalCount === 1 ? '1 resultado' : `${totalCount} resultados`

	return (
		<main id="main-content" tabIndex={-1} className="flex-1">
			{/* Breadcrumbs */}
			<div className="px-4 md:px-8 lg:px-12 pt-6 pb-4 border-b border-border">
				<nav aria-label="Breadcrumb">
					<ol className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
						<li>
							<Link
								href="/"
								className="hover:text-foreground transition-colors"
							>
								Inicio
							</Link>
						</li>
						<li aria-hidden="true" className="select-none">
							/
						</li>
						<li className="text-foreground" aria-current="page">
							Buscar
						</li>
					</ol>
				</nav>
			</div>

			{/* Search input */}
			<div className="px-4 md:px-8 lg:px-12 pt-8 pb-6">
				<h1 className="font-bold text-2xl md:text-3xl uppercase tracking-widest mb-6">
					Buscar
				</h1>
				<div className="relative max-w-2xl">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
						<Search
							className={`w-5 h-5 transition-colors ${isPending ? 'text-foreground animate-pulse' : 'text-muted-foreground'}`}
							aria-hidden="true"
						/>
					</div>
					<input
						ref={inputRef}
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Buscar productos..."
						className="w-full h-14 pl-12 pr-12 bg-secondary border border-border font-mono text-sm uppercase tracking-widest placeholder:text-muted-foreground placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors [&::-webkit-search-cancel-button]:hidden"
						aria-label="Buscar productos"
						aria-busy={isPending}
						autoComplete="off"
						// biome-ignore lint/a11y/noAutofocus: intencional en página de búsqueda
						autoFocus
					/>
					{query && (
						<button
							type="button"
							onClick={() => {
								setQuery('')
								inputRef.current?.focus()
							}}
							className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
							aria-label="Limpiar búsqueda"
						>
							<X className="w-4 h-4" aria-hidden="true" />
						</button>
					)}
				</div>
			</div>

			{/* Results */}
			<section
				className="px-4 md:px-8 lg:px-12 pb-16"
				aria-label="Resultados de búsqueda"
				aria-live="polite"
				aria-busy={isPending}
			>
				{/* Result count */}
				<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
					{debouncedQuery.trim() ? (
						<>
							{resultLabel} para{' '}
							<span className="text-foreground">
								&ldquo;{debouncedQuery.trim()}&rdquo;
							</span>
						</>
					) : (
						resultLabel
					)}
				</p>

				{/* Grid */}
				<div
					className={`transition-opacity duration-200 ${isPending ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
				>
					{products.length === 0 ? (
						<div className="border border-border p-12 text-center">
							<p className="font-bold uppercase tracking-wide text-sm">
								{debouncedQuery.trim()
									? `Sin resultados para "${debouncedQuery.trim()}"`
									: 'Sin productos disponibles'}
							</p>
							{debouncedQuery.trim() && (
								<p className="mt-2 text-sm text-muted-foreground">
									Intenta con otro término de búsqueda
								</p>
							)}
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-1 md:gap-x-1.5 gap-y-3 md:gap-y-4 lg:gap-y-5">
							{products.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					)}
				</div>
			</section>
		</main>
	)
}
