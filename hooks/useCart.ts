'use client'

import { useReducer, useEffect, useCallback } from 'react'

const CART_STORAGE_KEY = 'er-cart'

export type CartItem = {
	variantId: string
	productId: string
	name: string
	variantDetails: string
	price: number
	quantity: number
	maxStock: number
	image: string | null
	trackInventory: boolean
}

type CartState = {
	items: CartItem[]
	isOpen: boolean
}

type CartAction =
	| { type: 'ADD_ITEM'; item: CartItem }
	| { type: 'REMOVE_ITEM'; variantId: string }
	| { type: 'UPDATE_QUANTITY'; variantId: string; quantity: number }
	| { type: 'CLEAR' }
	| { type: 'SET_OPEN'; open: boolean }
	| { type: 'HYDRATE'; items: CartItem[] }

function cartReducer(
	state: CartState,
	action: CartAction,
): CartState {
	switch (action.type) {
		case 'ADD_ITEM': {
			const idx = state.items.findIndex(
				(i) => i.variantId === action.item.variantId,
			)
			if (idx >= 0) {
				const updated = [...state.items]
				const existing = updated[idx]!
				updated[idx] = {
					...existing,
					quantity: Math.min(
						existing.quantity + action.item.quantity,
						existing.maxStock,
					),
				}
				return { ...state, items: updated }
			}
			return { ...state, items: [...state.items, action.item] }
		}
		case 'REMOVE_ITEM':
			return {
				...state,
				items: state.items.filter(
					(i) => i.variantId !== action.variantId,
				),
			}
		case 'UPDATE_QUANTITY': {
			if (action.quantity <= 0) {
				return {
					...state,
					items: state.items.filter(
						(i) => i.variantId !== action.variantId,
					),
				}
			}
			return {
				...state,
				items: state.items.map((i) =>
					i.variantId === action.variantId
						? {
								...i,
								quantity: Math.min(action.quantity, i.maxStock),
							}
						: i,
				),
			}
		}
		case 'CLEAR':
			return { ...state, items: [] }
		case 'SET_OPEN':
			return { ...state, isOpen: action.open }
		case 'HYDRATE':
			return { ...state, items: action.items }
		default:
			return state
	}
}

export function useCart() {
	const [state, dispatch] = useReducer(cartReducer, {
		items: [],
		isOpen: false,
	})

	useEffect(() => {
		try {
			const stored = localStorage.getItem(CART_STORAGE_KEY)
			if (stored) {
				const items = JSON.parse(stored) as CartItem[]
				dispatch({ type: 'HYDRATE', items })
			}
		} catch {
			// Ignore invalid or missing storage
		}
	}, [])

	useEffect(() => {
		try {
			localStorage.setItem(
				CART_STORAGE_KEY,
				JSON.stringify(state.items),
			)
		} catch {
			// Ignore write errors (storage full, private mode, etc.)
		}
	}, [state.items])

	const count = state.items.reduce((sum, i) => sum + i.quantity, 0)
	const total = state.items.reduce(
		(sum, i) => sum + i.price * i.quantity,
		0,
	)

	const addItem = useCallback((item: CartItem) => {
		dispatch({ type: 'ADD_ITEM', item })
	}, [])

	const removeItem = useCallback((variantId: string) => {
		dispatch({ type: 'REMOVE_ITEM', variantId })
	}, [])

	const updateQuantity = useCallback(
		(variantId: string, quantity: number) => {
			dispatch({ type: 'UPDATE_QUANTITY', variantId, quantity })
		},
		[],
	)

	const clear = useCallback(() => {
		dispatch({ type: 'CLEAR' })
	}, [])

	const setOpen = useCallback((open: boolean) => {
		dispatch({ type: 'SET_OPEN', open })
	}, [])

	return {
		items: state.items,
		count,
		total,
		isOpen: state.isOpen,
		addItem,
		removeItem,
		updateQuantity,
		clear,
		setOpen,
	}
}
