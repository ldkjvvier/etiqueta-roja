function SkeletonCell() {
	return (
		<div className="aspect-4/5 bg-product-surface relative overflow-hidden">
			<div
				aria-hidden="true"
				className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/40 to-transparent motion-safe:animate-skeleton-scan motion-reduce:hidden"
			/>
		</div>
	)
}

export function ProductGridSkeleton() {
	return (
		<section
			className="pt-4 md:pt-8 lg:pt-12 pb-12 md:pb-16 lg:pb-24 border-b border-border"
			aria-label="Cargando productos"
			aria-busy="true"
		>
			<div className="px-4 md:px-8 lg:px-12">
				{/* Placeholder del header — mismo alto que el real para evitar CLS */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
					<div className="h-10 w-20 bg-secondary" />
					<div className="h-10 w-48 bg-secondary" />
				</div>

				{/* Placeholder de tabs */}
				<div className="h-12 border-b border-border mb-8 flex gap-6 items-end pb-3">
					<div className="h-3 w-14 bg-secondary" />
					<div className="h-3 w-20 bg-secondary" />
					<div className="h-3 w-16 bg-secondary" />
				</div>

				{/* Grid — mismo layout que ProductGrid para CLS < 0.1 */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-1 md:gap-x-1.5 gap-y-3 md:gap-y-4 lg:gap-y-5">
					{Array.from({ length: 8 }, (_, i) => (
						<SkeletonCell key={i} />
					))}
				</div>
			</div>
		</section>
	)
}
