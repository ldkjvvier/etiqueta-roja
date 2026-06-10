/**
 * Skeleton con la misma estructura y altura que ProductCard (tile 4:5 +
 * etiqueta colgante de 3 líneas) → el reemplazo por la tarjeta real no
 * produce layout shift. Compartido por el feed, la búsqueda y el fallback SSR.
 */
export function ProductCardSkeleton() {
	return (
		<div aria-hidden="true">
			<div className="relative aspect-4/5 overflow-hidden border border-b-0 border-border bg-product-surface">
				<div className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/40 to-transparent motion-safe:animate-skeleton-scan motion-reduce:hidden" />
			</div>
			<div className="space-y-2 border border-t-0 border-border bg-card px-3 pb-3 pt-2.5">
				<div className="h-2.5 w-1/2 bg-secondary" />
				<div className="h-3.5 w-3/4 bg-secondary" />
				<div className="h-4 w-1/3 bg-secondary" />
			</div>
		</div>
	)
}
