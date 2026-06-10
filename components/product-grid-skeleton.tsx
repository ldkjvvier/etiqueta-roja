import { ProductCardSkeleton } from './product-card-skeleton'

export function ProductGridSkeleton() {
	return (
		<section
			className="pt-4 md:pt-8 lg:pt-12 pb-8 md:pb-12 lg:pb-16 border-b border-border"
			aria-label="Cargando productos"
			aria-busy="true"
		>
			<div className="px-4 md:px-8 lg:px-12">
				{/* Mismo layout exacto que ProductGrid → CLS ~0 al hidratar */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 md:gap-x-3 gap-y-5 md:gap-y-6">
					{Array.from({ length: 12 }, (_, i) => (
						<ProductCardSkeleton key={i} />
					))}
				</div>
			</div>
		</section>
	)
}
