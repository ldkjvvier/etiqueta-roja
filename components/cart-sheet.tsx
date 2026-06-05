'use client'

import { useState } from 'react'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import { useStore } from '@/lib/store-context'
import { createPendingOrderFromCart } from '@/lib/actions/checkout'
import { CartLineItem } from '@/components/cart/cart-line-item'
import { CartEmptyState } from '@/components/cart/cart-empty-state'
import {
	CartCheckoutFooter,
	type CheckoutNotice,
} from '@/components/cart/cart-checkout-footer'

export function CartSheet() {
	const {
		cartItems,
		isCartOpen,
		setIsCartOpen,
		removeFromCart,
		clearCart,
		updateQuantity,
		cartTotal,
		whatsappNumber,
		generateWhatsAppMessage,
	} = useStore()
	const [checkoutLoading, setCheckoutLoading] = useState(false)
	const [checkoutNotice, setCheckoutNotice] = useState<CheckoutNotice | null>(
		null,
	)
	const [customerEmail, setCustomerEmail] = useState('')
	const [emailError, setEmailError] = useState('')

	const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
	const hasSoldOut = cartItems.some((item) => item.maxStock === 0)

	const isValidEmail = (email: string) =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

	const handleEmailChange = (value: string) => {
		setCustomerEmail(value)
		if (emailError) setEmailError('')
	}

	const handleWhatsAppCheckout = () => {
		setCheckoutNotice(null)
		setEmailError('')

		if (!whatsappNumber) {
			setCheckoutNotice({
				type: 'error',
				message: 'WhatsApp no está configurado para esta tienda.',
			})
			return
		}

		const normalizedEmail = customerEmail.trim().toLowerCase()
		if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
			setEmailError('Ingresa un email válido para continuar')
			return
		}

		setCheckoutLoading(true)

		createPendingOrderFromCart({
			items: cartItems.map((item) => ({
				id: item.id,
				name: item.name,
				size: item.size,
				variantId: item.variantId,
				quantity: item.quantity,
				price: item.price,
			})),
			whatsappNumber,
			customerEmail: normalizedEmail,
		})
			.then((result) => {
				if (result.error) {
					setCheckoutNotice({
						type: 'error',
						message: result.message || 'No se pudo crear la orden',
					})
					return
				}

				if (result.whatsappUrl) {
					window.open(result.whatsappUrl, '_blank')
				} else {
					window.open(generateWhatsAppMessage(), '_blank')
				}

				setCheckoutNotice({
					type: 'success',
					message: result.orderNumber
						? `Pedido ${result.orderNumber} creado correctamente. Si WhatsApp no se abrió, revisa el bloqueo de ventanas emergentes.`
						: 'Pedido creado correctamente. Si WhatsApp no se abrió, revisa el bloqueo de ventanas emergentes.',
				})
				setCustomerEmail('')
				clearCart()
			})
			.catch(() => {
				setCheckoutNotice({
					type: 'error',
					message: 'No se pudo crear la orden',
				})
			})
			.finally(() => {
				setCheckoutLoading(false)
			})
	}

	const isEmpty = cartItems.length === 0

	return (
		<Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
			<SheetContent
				id="cart-sheet"
				className="flex w-full flex-col gap-0 overscroll-contain border-l border-border bg-background p-0 sm:max-w-md"
			>
				<SheetHeader className="gap-0 border-b border-border-strong px-4 pb-4 pt-5">
					<div className="flex items-baseline gap-2 pr-8">
						<SheetTitle className="text-xl font-black uppercase tracking-tight">
							Tu carrito
						</SheetTitle>
						<span
							aria-hidden="true"
							className="font-mono text-sm font-bold tabular-nums text-primary"
						>
							({itemCount})
						</span>
					</div>
					<SheetDescription className="sr-only">
						Revisa los productos agregados al carrito, ajusta cantidades y
						completa tu pedido por WhatsApp.
					</SheetDescription>
				</SheetHeader>

				{isEmpty ? (
					<div className="flex flex-1 flex-col">
						{checkoutNotice ? (
							<p
								role={checkoutNotice.type === 'error' ? 'alert' : 'status'}
								aria-live="polite"
								className={`mx-4 mt-4 border-l-2 px-3 py-2 text-xs ${
									checkoutNotice.type === 'error'
										? 'border-primary text-primary-strong'
										: 'border-foreground text-foreground'
								}`}
							>
								{checkoutNotice.message}
							</p>
						) : null}
						<CartEmptyState onContinue={() => setIsCartOpen(false)} />
					</div>
				) : (
					<>
						<div className="flex items-center justify-between border-b border-border px-4 py-2">
							<span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
								{itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
							</span>
							<button
								type="button"
								onClick={() => clearCart()}
								className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							>
								Vaciar
							</button>
						</div>

						<ul className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
							{cartItems.map((item) => (
								<CartLineItem
									key={`${item.id}-${item.size}`}
									item={item}
									onRemove={removeFromCart}
									onUpdateQuantity={updateQuantity}
								/>
							))}
						</ul>

						<div className="px-4">
							<CartCheckoutFooter
								cartTotal={cartTotal}
								email={customerEmail}
								emailError={emailError}
								onEmailChange={handleEmailChange}
								notice={checkoutNotice}
								isLoading={checkoutLoading}
								whatsappAvailable={Boolean(whatsappNumber)}
								hasSoldOut={hasSoldOut}
								onCheckout={handleWhatsAppCheckout}
							/>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	)
}
