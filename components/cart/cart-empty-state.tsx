'use client'

import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CartEmptyStateProps {
	onContinue: () => void
}

/**
 * Estado vacío editorial — bloque centrado con ícono vectorial, copy en
 * font-mono mayúsculas y CTA con el estilo de botón outline de la marca.
 */
export function CartEmptyState({ onContinue }: CartEmptyStateProps) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
			<div className="flex size-20 items-center justify-center border border-border-strong">
				<ShoppingBag className="size-8 text-foreground" strokeWidth={1.5} />
			</div>
			<div className="space-y-1">
				<p className="font-mono text-sm font-bold uppercase tracking-widest">
					Tu carrito está vacío
				</p>
				<p className="text-xs text-muted-foreground">
					Agrega productos para verlos aquí.
				</p>
			</div>
			<Button
				onClick={onContinue}
				variant="outline"
				className="h-12 rounded-none border-2 border-foreground px-8 text-sm font-bold uppercase tracking-widest transition-colors duration-150 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			>
				Seguir comprando
			</Button>
		</div>
	)
}
