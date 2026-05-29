'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
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
			<Toaster richColors position="top-right" />
		</StoreProvider>
	)
}
