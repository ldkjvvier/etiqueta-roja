import { cn } from '@/lib/utils'

export type BadgeKind = 'offer' | 'low_stock'

const BADGE_LABELS: Record<BadgeKind, string> = {
	offer: 'OFERTA',
	low_stock: 'ÚLTIMO',
}

/**
 * Etiqueta sutil — una sola instancia por tarjeta.
 * Prioridad de render: low_stock → offer (sold_out se maneja como overlay en la tarjeta).
 * Estilo limpio: pill crema (bg-background) + texto rojo (acento de marca), sin caja sólida.
 * El fondo translúcido garantiza contraste sobre cualquier foto (color-not-only + AA).
 */
export function ProductBadge({
	kind,
	className,
}: {
	kind: BadgeKind
	className?: string
}) {
	return (
		<span
			className={cn(
				'absolute top-2 left-2 z-20',
				'bg-background/90 text-primary-strong',
				'font-mono text-[10px] font-bold uppercase tracking-[0.15em]',
				'px-1.5 py-0.5',
				className,
			)}
		>
			{BADGE_LABELS[kind]}
		</span>
	)
}
