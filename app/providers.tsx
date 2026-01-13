'use client'

import type { ReactNode } from 'react'
import { StoreProvider } from '@/lib/store-context'

export function Providers({ children }: { children: ReactNode }) {
	return <StoreProvider>{children}</StoreProvider>
}
