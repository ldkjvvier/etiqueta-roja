'use client'

import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CartItem } from '@/lib/store-context'
import { formatPrice } from '@/lib/utils'

interface CartLineItemProps {
	item: CartItem
	onRemove: (id: string, size: string) => void
	onUpdateQuantity: (id: string, size: string, quantity: number) => void
}

/**
 * Fila de producto del carrito — alineada con el lenguaje editorial de las
 * product cards: tile de imagen sobre bg-product-surface (#eaeaea), nombre en
 * mayúsculas con tracking, precio en font-mono tabular-nums. Esquinas rectas
 * (--radius: 0), acento rojo en el foco/hover. Touch targets ≥ 44px.
 */
export function CartLineItem({
	item,
	onRemove,
	onUpdateQuantity,
}: CartLineItemProps) {
	const isSoldOut = item.maxStock === 0
	const atMaxStock = item.maxStock > 0 && item.quantity >= item.maxStock

	return (
		<li className="group/item flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0 sm:gap-4">
			{/* Tile de imagen — mismo gris fotográfico que las product cards */}
			<div className="relative aspect-4/5 w-20 shrink-0 overflow-hidden bg-product-surface sm:w-24">
				<Image
					src={item.image || '/placeholder.svg'}
					alt={item.name}
					fill
					sizes="(max-width: 640px) 80px, 96px"
					className="object-cover"
				/>
				{isSoldOut && (
					<div className="absolute inset-0 flex items-end justify-center bg-product-surface/30">
						<span className="mb-2 bg-background/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-primary-strong">
							Agotado
						</span>
					</div>
				)}
			</div>

			{/* Detalle */}
			<div className="flex flex-1 flex-col">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<h3 className="line-clamp-2 text-xs font-medium uppercase leading-snug tracking-wide sm:text-sm">
							{item.name}
						</h3>
						<p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
							Talla · {item.size}
						</p>
						{atMaxStock && !isSoldOut && (
							<p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-strong">
								Stock máx. ({item.maxStock})
							</p>
						)}
					</div>

					<Button
						variant="ghost"
						size="icon"
						className="-mr-1 -mt-1 size-8 shrink-0 text-muted-foreground hover:bg-transparent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						aria-label={`Eliminar ${item.name} talla ${item.size}`}
						onClick={() => onRemove(item.id, item.size)}
					>
						<X className="size-4" />
					</Button>
				</div>

				{/* Stepper + precio */}
				<div className="mt-auto flex items-end justify-between gap-2 pt-3">
					<div className="flex items-center border border-border-strong">
						<Button
							variant="ghost"
							size="icon"
							className="size-9 rounded-none text-foreground hover:bg-foreground hover:text-background disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							aria-label={`Restar una unidad de ${item.name} talla ${item.size}`}
							disabled={item.quantity <= 1}
							onClick={() =>
								onUpdateQuantity(item.id, item.size, item.quantity - 1)
							}
						>
							<Minus className="size-3" />
						</Button>
						<span className="w-8 text-center font-mono text-sm font-bold tabular-nums">
							{item.quantity}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="size-9 rounded-none text-foreground hover:bg-foreground hover:text-background disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							aria-label={`Sumar una unidad de ${item.name} talla ${item.size}`}
							disabled={atMaxStock || isSoldOut}
							onClick={() =>
								onUpdateQuantity(item.id, item.size, item.quantity + 1)
							}
						>
							<Plus className="size-3" />
						</Button>
					</div>

					<span className="font-mono text-sm font-bold tabular-nums">
						{formatPrice(item.price * item.quantity)}
					</span>
				</div>
			</div>
		</li>
	)
}
