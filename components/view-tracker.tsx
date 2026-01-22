'use client'

import { useEffect, useRef } from 'react'
import { incrementProductView } from '@/lib/actions/analytics'

export function ViewTracker({ productId }: { productId: string }) {
	const hasIncremented = useRef(false)

	useEffect(() => {
		if (!hasIncremented.current) {
			incrementProductView(productId)
			hasIncremented.current = true
		}
	}, [productId])

	return null
}
