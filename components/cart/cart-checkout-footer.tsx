'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export type CheckoutNotice = {
	type: 'error' | 'success'
	message: string
}

interface CartCheckoutFooterProps {
	cartTotal: number
	email: string
	emailError: string
	onEmailChange: (value: string) => void
	notice: CheckoutNotice | null
	isLoading: boolean
	whatsappAvailable: boolean
	hasSoldOut: boolean
	onCheckout: () => void
}

/**
 * Pie del carrito — subtotal en font-mono tabular-nums, input de email con el
 * mismo lenguaje del buscador (bg-secondary + foco rojo de marca) y CTA de
 * WhatsApp a ancho completo. Esquinas rectas, feedback accesible (aria-live).
 */
export function CartCheckoutFooter({
	cartTotal,
	email,
	emailError,
	onEmailChange,
	notice,
	isLoading,
	whatsappAvailable,
	hasSoldOut,
	onCheckout,
}: CartCheckoutFooterProps) {
	const disabled = isLoading || !whatsappAvailable || hasSoldOut

	const ctaLabel = isLoading
		? 'Procesando…'
		: !whatsappAvailable
			? 'WhatsApp no disponible'
			: hasSoldOut
				? 'Elimina productos agotados'
				: 'Enviar pedido a WhatsApp'

	return (
		<div
			className="space-y-4 border-t border-border-strong pt-4"
			style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
		>
			{/* Subtotal */}
			<div className="flex items-baseline justify-between">
				<span className="font-mono text-xs font-bold uppercase tracking-widest">
					Subtotal
				</span>
				<span className="font-mono text-xl font-black tabular-nums">
					{formatPrice(cartTotal)}
				</span>
			</div>

			{/* Email */}
			<div className="space-y-2">
				<label
					htmlFor="checkout-email"
					className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
				>
					Tu email
				</label>
				<input
					id="checkout-email"
					type="email"
					autoComplete="email"
					inputMode="email"
					placeholder="nombre@ejemplo.com"
					value={email}
					onChange={(event) => onEmailChange(event.target.value)}
					aria-invalid={Boolean(emailError)}
					aria-describedby={emailError ? 'checkout-email-error' : undefined}
					className="h-11 w-full border border-border bg-secondary px-3 font-mono text-sm tracking-wide transition-colors placeholder:text-muted-foreground focus:border-brand-red focus:outline-none"
				/>
				{emailError ? (
					<p
						id="checkout-email-error"
						role="alert"
						className="font-mono text-[10px] uppercase tracking-widest text-primary-strong"
					>
						{emailError}
					</p>
				) : (
					<p className="text-xs text-muted-foreground">
						Lo usamos para identificar y dar seguimiento a tu pedido.
					</p>
				)}
			</div>

			{/* Notice */}
			{notice ? (
				<p
					role={notice.type === 'error' ? 'alert' : 'status'}
					aria-live="polite"
					className={`border-l-2 px-3 py-2 text-xs ${
						notice.type === 'error'
							? 'border-primary text-primary-strong'
							: 'border-foreground text-foreground'
					}`}
				>
					{notice.message}
				</p>
			) : null}

			{/* CTA */}
			<Button
				onClick={onCheckout}
				disabled={disabled}
				className="h-14 w-full gap-2 rounded-none bg-primary text-base font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
			>
				<MessageCircle className="size-5 shrink-0" />
				{ctaLabel}
			</Button>
			<p className="text-center text-[11px] text-muted-foreground">
				Se abrirá WhatsApp con el resumen de tu pedido
			</p>
		</div>
	)
}
