import { cn } from '@/lib/utils'

export type BadgeKind = 'offer' | 'low_stock'

const BADGE_FALLBACK_LABELS: Record<BadgeKind, string> = {
	offer: 'OFERTA',
	low_stock: 'ÚLTIMAS',
}

/**
 * Sticker de la tarjeta — una sola instancia por tarjeta.
 * Prioridad de render: low_stock → offer (sold_out se maneja como overlay).
 *
 * `offer` es la "etiqueta roja" literal de la marca: bloque rojo sólido con el
 * % de descuento (ej. "−25%") cuando `label` viene calculado desde la tarjeta.
 * `low_stock` invierte el esquema: crema translúcida + texto rojo.
 * Ambos pares cumplen contraste AA (primary-strong #c81e1e fue elegido para eso).
 */
export function ProductBadge({
	kind,
	label,
	className,
}: {
	kind: BadgeKind
	label?: string
	className?: string
}) {
	return (
		<span
			className={cn(
				'absolute top-2 left-2 z-20',
				'px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] tabular-nums',
				kind === 'offer'
					? 'bg-primary-strong text-primary-foreground'
					: 'bg-background/95 text-primary-strong',
				className,
			)}
		>
			{label ?? BADGE_FALLBACK_LABELS[kind]}
		</span>
	)
}
