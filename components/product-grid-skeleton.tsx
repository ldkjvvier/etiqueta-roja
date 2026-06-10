function SkeletonCell() {
	return (
		<div aria-hidden="true">
			<div className="aspect-4/5 bg-product-surface relative overflow-hidden">
				<div className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/40 to-transparent motion-safe:animate-skeleton-scan motion-reduce:hidden" />
			</div>
			{/* Placeholder del texto para igualar la altura real de ProductCard (sin CLS) */}
			<div className="pt-3 space-y-1">
				<div className="h-3.5 w-3/4 bg-secondary" />
				<div className="h-4 w-1/3 bg-secondary" />
			</div>
		</div>
	)
}

export function ProductGridSkeleton() {
	return (
		<section
			className="pt-4 md:pt-8 lg:pt-12 pb-8 md:pb-12 lg:pb-16 border-b border-border"
			aria-label="Cargando productos"
			aria-busy="true"
		>
			<div className="px-4 md:px-8 lg:px-12">
				{/* Mismo layout exacto que ProductGrid → CLS ~0 al hidratar */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-1 md:gap-x-1.5 gap-y-3 md:gap-y-4 lg:gap-y-5">
					{Array.from({ length: 12 }, (_, i) => (
						<SkeletonCell key={i} />
					))}
				</div>
			</div>
		</section>
	)
}
