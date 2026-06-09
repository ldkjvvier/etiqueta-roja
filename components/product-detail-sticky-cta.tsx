'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface ProductStickyCtaMobileProps {
	price: number
	selectedSize: string | null
	disabled: boolean
	isSoldOut: boolean
	onWhatsApp: () => void
}

export function ProductStickyCtaMobile({
	price,
	selectedSize,
	disabled,
	isSoldOut,
	onWhatsApp,
}: ProductStickyCtaMobileProps) {
	return (
		<div
			className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-border bg-background/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm lg:hidden"
			aria-label="Acción rápida de compra"
		>
			<div className="flex min-w-0 flex-col">
				<span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
					{selectedSize ? `Talla ${selectedSize}` : 'Elige tu talla'}
				</span>
				<span className="font-black tabular-nums">
					{formatPrice(price)}
				</span>
			</div>
			<Button
				onClick={onWhatsApp}
				disabled={disabled || isSoldOut}
				className="h-12 flex-1 gap-2 bg-primary font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
				{isSoldOut
					? 'AGOTADO'
					: selectedSize
						? 'PEDIR POR WHATSAPP'
						: 'SELECCIONA TU TALLA'}
			</Button>
		</div>
	)
}
