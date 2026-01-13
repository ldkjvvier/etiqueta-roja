'use client'

import { Minus, Plus, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import { useStore } from '@/lib/store-context'

export function CartSheet() {
	const {
		cartItems,
		isCartOpen,
		setIsCartOpen,
		removeFromCart,
		updateQuantity,
		cartTotal,
		generateWhatsAppMessage,
	} = useStore()

	const handleWhatsAppCheckout = () => {
		window.open(generateWhatsAppMessage(), '_blank')
	}

	return (
		<Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
			<SheetContent className="w-full sm:max-w-md bg-background border-l border-border flex flex-col">
				<SheetHeader className="border-b border-border pb-4">
					<SheetTitle className="text-xl font-black tracking-tight">
						TU CARRITO ({cartItems.length})
					</SheetTitle>
				</SheetHeader>

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
									<div className="w-20 h-20 bg-secondary flex-shrink-0">
										<img
											src={item.image || '/placeholder.svg'}
											alt={item.name}
											className="w-full h-full object-cover"
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
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 hover:bg-transparent hover:text-primary"
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
													onClick={() =>
														updateQuantity(
															item.id,
															item.size,
															item.quantity - 1
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
													onClick={() =>
														updateQuantity(
															item.id,
															item.size,
															item.quantity + 1
														)
													}
												>
													<Plus className="h-3 w-3" />
												</Button>
											</div>
											<span className="font-bold">
												${item.price * item.quantity}
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
									${cartTotal}
								</span>
							</div>
							<Button
								onClick={handleWhatsAppCheckout}
								className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6 gap-2"
							>
								<MessageCircle className="h-5 w-5" />
								ENVIAR PEDIDO A WHATSAPP
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
