'use client'

import type { ReactNode } from 'react'
import { StoreProvider } from '@/lib/store-context'

interface ProvidersProps {
	children: ReactNode
	whatsappNumber?: string
}

export function Providers({
	children,
	whatsappNumber,
}: ProvidersProps) {
	return (
		<StoreProvider whatsappNumber={whatsappNumber}>
			{children}
		</StoreProvider>
	)
}
