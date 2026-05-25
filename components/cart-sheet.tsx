'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Minus, Plus, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import { useStore } from '@/lib/store-context'
import { formatPrice } from '@/lib/utils'
import { createPendingOrderFromCart } from '@/lib/actions/checkout'

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
	const [checkoutNotice, setCheckoutNotice] = useState<{
		type: 'error' | 'success'
		message: string
	} | null>(null)

	const handleWhatsAppCheckout = () => {
		setCheckoutNotice(null)

		if (!whatsappNumber) {
			setCheckoutNotice({
				type: 'error',
				message: 'WhatsApp no está configurado para esta tienda.',
			})
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

	return (
		<Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
			<SheetContent
				id="cart-sheet"
				className="flex w-full flex-col border-l border-border bg-background overscroll-contain sm:max-w-md"
			>
				<SheetHeader className="border-b border-border pb-4">
					<SheetTitle className="text-xl font-black tracking-tight">
						TU CARRITO ({cartItems.length})
					</SheetTitle>
				</SheetHeader>

				{checkoutNotice ? (
					<p
						role={
							checkoutNotice.type === 'error' ? 'alert' : 'status'
						}
						aria-live="polite"
						className={`mt-4 border px-4 py-3 text-sm ${
							checkoutNotice.type === 'error'
								? 'border-destructive/30 text-destructive'
								: 'border-primary/30 text-foreground'
						}`}
					>
						{checkoutNotice.message}
					</p>
				) : null}

				{cartItems.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center gap-4">
						<p className="text-muted-foreground font-medium">
							Tu carrito está vacío
						</p>
						<Button
							onClick={() => setIsCartOpen(false)}
							className="bg-primary text-primary-foreground hover:bg-foreground font-bold px-8"
						>
							SEGUIR COMPRANDO
						</Button>
					</div>
				) : (
					<>
						<div className="flex-1 overflow-y-auto py-4 space-y-4">
							{cartItems.map((item) => (
								<div
									key={`${item.id}-${item.size}`}
									className="flex gap-4 p-4 border border-border"
								>
									<div className="w-20 h-20 bg-secondary shrink-0">
										<Image
											src={item.image || '/placeholder.svg'}
											alt={item.name}
											width={80}
											height={80}
											sizes="80px"
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="flex-1 flex flex-col">
										<div className="flex justify-between items-start">
											<div>
												<h3 className="font-bold text-sm uppercase">
													{item.name}
												</h3>
												<p className="text-muted-foreground text-xs mt-1">
													Talla: {item.size}
												</p>
												{item.maxStock === 0 && (
													<p className="text-destructive text-xs font-black mt-1 uppercase tracking-wider">
														¡Agotado!
													</p>
												)}
												{item.maxStock > 0 &&
													item.quantity >= item.maxStock && (
														<p className="text-destructive text-[10px] font-bold mt-1 uppercase">
															Stock Máximo Alcanzado ({item.maxStock})
														</p>
													)}
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 hover:bg-transparent hover:text-primary"
												aria-label={`Eliminar ${item.name} talla ${item.size}`}
												onClick={() =>
													removeFromCart(item.id, item.size)
												}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
										<div className="flex items-center justify-between mt-auto">
											<div className="flex items-center border border-border">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 hover:bg-secondary"
													aria-label={`Restar una unidad de ${item.name} talla ${item.size}`}
													onClick={() =>
														updateQuantity(
															item.id,
															item.size,
															item.quantity - 1,
														)
													}
												>
													<Minus className="h-3 w-3" />
												</Button>
												<span className="w-8 text-center text-sm font-bold">
													{item.quantity}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 hover:bg-secondary"
													aria-label={`Sumar una unidad de ${item.name} talla ${item.size}`}
													disabled={item.quantity >= item.maxStock}
													onClick={() =>
														updateQuantity(
															item.id,
															item.size,
															item.quantity + 1,
														)
													}
												>
													<Plus className="h-3 w-3" />
												</Button>
											</div>
											<span className="font-bold">
												{formatPrice(item.price * item.quantity)}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="border-t border-border pt-4 space-y-4">
							<div className="flex justify-between items-center">
								<span className="font-bold uppercase">Subtotal</span>
								<span className="text-xl font-black">
									{formatPrice(cartTotal)}
								</span>
							</div>
							<Button
								onClick={handleWhatsAppCheckout}
								disabled={
									checkoutLoading ||
									!whatsappNumber ||
									cartItems.some((item) => item.maxStock === 0)
								}
								className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<MessageCircle className="h-5 w-5" />
								{checkoutLoading
									? 'PROCESANDO…'
									: !whatsappNumber
										? 'WHATSAPP NO DISPONIBLE'
										: cartItems.some((item) => item.maxStock === 0)
											? 'ELIMINA PRODUCTOS AGOTADOS'
											: 'ENVIAR PEDIDO A WHATSAPP'}
							</Button>
							<p className="text-center text-xs text-muted-foreground">
								Se abrirá WhatsApp con el resumen de tu pedido
							</p>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	)
}
