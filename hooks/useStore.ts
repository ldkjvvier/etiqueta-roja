'use client'

// ASSUMPTION: storeName and publicConfig are populated server-side and passed
// to a Provider wrapping the app. This hook exposes the store slug synchronously
// (from env) and relies on an optional context for richer metadata.
// To extend: create a StoreDataContext that fetches from /api/store/config
// and wrap the app layout with it, then read it here via useContext.

const STORE_SLUG = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG ?? ''

export type UseStoreReturn = {
	storeSlug: string
	storeName: string | null
	publicConfig: Record<string, unknown> | null
}

export function useStore(): UseStoreReturn {
	return {
		storeSlug: STORE_SLUG,
		storeName: null,
		publicConfig: null,
	}
}
