'use client'
import { formatPrice } from '@/lib/utils'
import { validateCartStock } from '@/lib/actions/products'
import { toast } from 'sonner'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react'

export type CartItem = {
	id: string
	name: string
	price: number
	size: string
	variantId?: string
	combinationKey?: string
	quantity: number
	image: string
	maxStock: number
}

export type ProductVariant = {
	id: string
	size: string
	stock: number
	trackInventory?: boolean
	stockQuantity?: number
	reservedStock?: number
	lowStockThreshold?: number
	combinationKey?: string
	price?: number | null
	imageUrl?: string | null
	sku?: string | null
}

export type Product = {
	id: string
	slug?: string
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
	clearCart: () => void
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
	whatsappNumber: string
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
	whatsappNumber,
}: StoreProviderProps) {
	const sanitizedWhatsappNumber = (whatsappNumber ?? '').replace(
		/[^0-9]/g,
		'',
	)
	const [cartItems, setCartItems] = useState<CartItem[]>([])
	const [isCartOpen, setIsCartOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedProduct, setSelectedProduct] =
		useState<Product | null>(null)
	const [isLoaded, setIsLoaded] = useState(false)

	const sameCartLine = (
		left: Pick<CartItem, 'id' | 'size' | 'variantId'>,
		right: Pick<CartItem, 'id' | 'size' | 'variantId'>,
	) => {
		if (left.id !== right.id) return false
		if (left.variantId && right.variantId) {
			return left.variantId === right.variantId
		}
		return left.size === right.size
	}

	// Ref para obtener siempre el snapshot más reciente de cartItems
	// sin convertirlo en dependencia del efecto de isCartOpen.
	const cartItemsRef = useRef(cartItems)
	useEffect(() => {
		cartItemsRef.current = cartItems
	}, [cartItems])

	// C-02: validateCart como useCallback con deps vacías — setCartItems y
	// validateCartStock son referencias estables; el estado se lee via ref.
	const validateCart = useCallback(async (items: CartItem[]) => {
		if (items.length === 0) return
		const normalize = (value: string) =>
			(value || '').trim().toLowerCase().replace(/\s+/g, '-')

		try {
			const stockMap = await validateCartStock(
				items.map((i) => ({
					id: i.id,
					size: i.size,
					variantId: i.variantId,
				})),
			)

			setCartItems((prev) =>
				prev.map((item) => {
					const key = item.variantId
						? `${item.id}-variant:${item.variantId}`
						: `${item.id}-${normalize(item.size)}`
					const realStock = stockMap[key]

					if (typeof realStock === 'number') {
						return { ...item, maxStock: realStock }
					}
					return item
				}),
			)
		} catch (error) {
			console.error('Error verifying stock:', error)
		}
	}, [])

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
	}, [validateCart])

	// Re-validate cuando se abre el carrito — usa ref para evitar stale closure
	useEffect(() => {
		if (isCartOpen && cartItemsRef.current.length > 0) {
			validateCart(cartItemsRef.current)
		}
	}, [isCartOpen, validateCart])

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		if (isLoaded) {
			localStorage.setItem(
				'etiqueta-roja-cart',
				JSON.stringify(cartItems),
			)
		}
	}, [cartItems, isLoaded])

	// C-04: verificar max stock antes de actualizar para poder mostrar toast
	const addToCart = (item: Omit<CartItem, 'quantity'>) => {
		const current = cartItemsRef.current
		const existing = current.find((i) => sameCartLine(i, item))

		if (existing && existing.quantity >= existing.maxStock) {
			toast.error('Stock máximo alcanzado', {
				description: 'Ya tenés el máximo disponible en tu carrito.',
			})
			return
		}

		setCartItems((prev) => {
			const ex = prev.find((i) => sameCartLine(i, item))
			if (ex) {
				if (ex.quantity >= ex.maxStock) return prev
				return prev.map((i) =>
					sameCartLine(i, item)
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

	const clearCart = () => {
		setCartItems([])
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
		const cleanNumber = sanitizedWhatsappNumber

		if (!cleanNumber) {
			return ''
		}

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
				clearCart,
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
				whatsappNumber: sanitizedWhatsappNumber,
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
