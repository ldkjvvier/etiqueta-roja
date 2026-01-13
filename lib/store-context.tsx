'use client'

import {
	createContext,
	useContext,
	useState,
	type ReactNode,
} from 'react'

export type CartItem = {
	id: string
	name: string
	price: number
	size: string
	quantity: number
	image: string
}

export type Product = {
	id: string
	name: string
	price: number
	originalPrice?: number
	image: string
	images: string[] // Array of 3 images for carousel
	sizes: string[]
	stockStatus: 'available' | 'low' | 'sold_out'
	description?: string
	category?: string
}

type StoreContextType = {
	cartItems: CartItem[]
	addToCart: (item: Omit<CartItem, 'quantity'>) => void
	removeFromCart: (id: string, size: string) => void
	updateQuantity: (id: string, size: string, quantity: number) => void
	cartCount: number
	cartTotal: number
	isCartOpen: boolean
	setIsCartOpen: (open: boolean) => void
	isMobileMenuOpen: boolean
	setIsMobileMenuOpen: (open: boolean) => void
	selectedProduct: Product | null
	setSelectedProduct: (product: Product | null) => void
	generateWhatsAppMessage: (
		product?: Product,
		size?: string
	) => string
}

const StoreContext = createContext<StoreContextType | undefined>(
	undefined
)

const WHATSAPP_NUMBER = '5491123456789' // Replace with actual number

export function StoreProvider({ children }: { children: ReactNode }) {
	const [cartItems, setCartItems] = useState<CartItem[]>([])
	const [isCartOpen, setIsCartOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] =
		useState<Product | null>(null)

	const addToCart = (item: Omit<CartItem, 'quantity'>) => {
		setCartItems((prev) => {
			const existing = prev.find(
				(i) => i.id === item.id && i.size === item.size
			)
			if (existing) {
				return prev.map((i) =>
					i.id === item.id && i.size === item.size
						? { ...i, quantity: i.quantity + 1 }
						: i
				)
			}
			return [...prev, { ...item, quantity: 1 }]
		})
		setIsCartOpen(true)
	}

	const removeFromCart = (id: string, size: string) => {
		setCartItems((prev) =>
			prev.filter((i) => !(i.id === id && i.size === size))
		)
	}

	const updateQuantity = (
		id: string,
		size: string,
		quantity: number
	) => {
		if (quantity <= 0) {
			removeFromCart(id, size)
			return
		}
		setCartItems((prev) =>
			prev.map((i) =>
				i.id === id && i.size === size ? { ...i, quantity } : i
			)
		)
	}

	const generateWhatsAppMessage = (
		product?: Product,
		size?: string
	) => {
		if (product && size) {
			// Single product order
			const message = `Hola Etiqueta Roja, me interesa el ${product.name} en talla ${size}.`
			return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
				message
			)}`
		} else {
			// Cart order
			let message =
				'Hola Etiqueta Roja, me interesa hacer el siguiente pedido:\n\n'
			cartItems.forEach((item) => {
				message += `• ${item.name} - Talla: ${
					item.size
				} - Cantidad: ${item.quantity} - $${
					item.price * item.quantity
				}\n`
			})
			message += `\nTotal: $${cartTotal}`
			return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
				message
			)}`
		}
	}

	const cartCount = cartItems.reduce(
		(acc, item) => acc + item.quantity,
		0
	)
	const cartTotal = cartItems.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0
	)

	return (
		<StoreContext.Provider
			value={{
				cartItems,
				addToCart,
				removeFromCart,
				updateQuantity,
				cartCount,
				cartTotal,
				isCartOpen,
				setIsCartOpen,
				isMobileMenuOpen,
				setIsMobileMenuOpen,
				selectedProduct,
				setSelectedProduct,
				generateWhatsAppMessage,
			}}
		>
			{children}
		</StoreContext.Provider>
	)
}

export function useStore() {
	const context = useContext(StoreContext)
	if (!context) {
		throw new Error('useStore must be used within a StoreProvider')
	}
	return context
}
