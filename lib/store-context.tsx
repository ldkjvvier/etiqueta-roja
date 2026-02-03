'use client'
import { formatPrice } from '@/lib/utils'
import { validateCartStock } from '@/lib/actions/products'

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react'

export type CartItem = {
	id: string
	name: string
	price: number
	size: string
	quantity: number
	image: string
	maxStock: number
}

export type ProductVariant = {
	size: string
	stock: number
}

export type Product = {
	id: string
	name: string
	price: number
	originalPrice?: number
	image: string
	images?: string[]
	sizes: string[]
	variants?: ProductVariant[]
	stockStatus: 'available' | 'low' | 'sold_out'
	category?: string
	description?: string
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
	searchQuery: string
	setSearchQuery: (query: string) => void
	selectedProduct: Product | null
	setSelectedProduct: (product: Product | null) => void
	generateWhatsAppMessage: (
		product?: Product,
		size?: string,
	) => string
}

const StoreContext = createContext<StoreContextType | undefined>(
	undefined,
)

interface StoreProviderProps {
	children: ReactNode
	whatsappNumber?: string
}

export function StoreProvider({
	children,
	whatsappNumber = '5491123456789',
}: StoreProviderProps) {
	const [cartItems, setCartItems] = useState<CartItem[]>([])
	const [isCartOpen, setIsCartOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedProduct, setSelectedProduct] =
		useState<Product | null>(null)
	const [isLoaded, setIsLoaded] = useState(false)

	const validateCart = async (items: CartItem[]) => {
		if (items.length === 0) return

		try {
			const stockMap = await validateCartStock(
				items.map((i) => ({ id: i.id, size: i.size })),
			)

			setCartItems((prev) =>
				prev.map((item) => {
					const key = `${item.id}-${item.size}`
					const realStock = stockMap[key]

					// If we got a valid stock number back, update the item
					if (typeof realStock === 'number') {
						return { ...item, maxStock: realStock }
					}
					return item
				}),
			)
		} catch (error) {
			console.error('Error verifying stock:', error)
		}
	}

	// Load cart from localStorage on mount
	useEffect(() => {
		const savedCart = localStorage.getItem('etiqueta-roja-cart')
		if (savedCart) {
			try {
				const items = JSON.parse(savedCart)
				setCartItems(items)
				validateCart(items)
			} catch (e) {
				console.error('Failed to parse cart:', e)
			}
		}
		setIsLoaded(true)
	}, [])

	// Re-validate when opening cart
	useEffect(() => {
		if (isCartOpen && cartItems.length > 0) {
			validateCart(cartItems)
		}
	}, [isCartOpen])

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		if (isLoaded) {
			localStorage.setItem(
				'etiqueta-roja-cart',
				JSON.stringify(cartItems),
			)
		}
	}, [cartItems, isLoaded])

	const addToCart = (item: Omit<CartItem, 'quantity'>) => {
		setCartItems((prev) => {
			const existing = prev.find(
				(i) => i.id === item.id && i.size === item.size,
			)
			if (existing) {
				// Prevent adding more than maxStock
				if (existing.quantity >= existing.maxStock) {
					return prev
				}
				return prev.map((i) =>
					i.id === item.id && i.size === item.size
						? { ...i, quantity: i.quantity + 1 }
						: i,
				)
			}
			return [...prev, { ...item, quantity: 1 }]
		})
		setIsCartOpen(true)
	}

	const removeFromCart = (id: string, size: string) => {
		setCartItems((prev) =>
			prev.filter((i) => !(i.id === id && i.size === size)),
		)
	}

	const updateQuantity = (
		id: string,
		size: string,
		quantity: number,
	) => {
		if (quantity <= 0) {
			removeFromCart(id, size)
			return
		}
		setCartItems((prev) =>
			prev.map((i) => {
				if (i.id === id && i.size === size) {
					// Prevent exceeding maxStock
					if (quantity > i.maxStock) return i
					return { ...i, quantity }
				}
				return i
			}),
		)
	}

	const generateWhatsAppMessage = (
		product?: Product,
		size?: string,
	) => {
		const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')

		if (product && size) {
			// Single product order
			const message = `Hola Etiqueta Roja, me interesa el ${product.name} en talla ${size}.`
			return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
				message,
			)}`
		} else {
			// Cart order
			let message =
				'Hola Etiqueta Roja, me interesa hacer el siguiente pedido:\n\n'
			cartItems.forEach((item) => {
				message += `• ${item.name} - Talla: ${
					item.size
				} - Cantidad: ${item.quantity} - ${formatPrice(
					item.price * item.quantity,
				)}\n`
			})
			message += `\nTotal: ${formatPrice(cartTotal)}`
			return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
				message,
			)}`
		}
	}

	const cartCount = cartItems.reduce(
		(acc, item) => acc + item.quantity,
		0,
	)
	const cartTotal = cartItems.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0,
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
				searchQuery,
				setSearchQuery,
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
