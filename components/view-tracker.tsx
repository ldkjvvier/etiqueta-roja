'use client'

import { useEffect, useRef } from 'react'
import { incrementProductView } from '@/lib/actions/analytics'

export function ViewTracker({ productId }: { productId: string }) {
	const calledOnce = useRef(false)

	useEffect(() => {
		// Prevent double calling in React Strict Mode or fast remounts
		if (calledOnce.current) return
		calledOnce.current = true

		// Check session storage to avoid spamming refreshes
		const storageKey = `viewed_product_${productId}`
		const hasViewedRecently = sessionStorage.getItem(storageKey)

		if (!hasViewedRecently) {
			incrementProductView(productId)
			// Mark as viewed for this session
			sessionStorage.setItem(storageKey, 'true')
		}
	}, [productId])

	return null
}
