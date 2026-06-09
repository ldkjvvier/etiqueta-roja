import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getPublicStoreContext } from '@/lib/data/admin-context'

export type StoreInfo = {
	name: string
	tagline: string | null
	description: string | null
	address: string | null
	founded_year: number | null
	rut: string | null
}

const FALLBACK: StoreInfo = {
	name: 'Etiqueta Roja',
	tagline: null,
	description: null,
	address: null,
	founded_year: null,
	rut: null,
}

/**
 * Lee la identidad pública de la tienda desde la tabla `stores`.
 * RLS permite el SELECT público de la tienda activa, así que sirve tanto al
 * storefront (anon: layout/footer) como al admin (página ya auth-gated).
 * Envuelto en React cache() para deduplicar entre generateMetadata y el render.
 */
export const getStoreInfo = cache(async (): Promise<StoreInfo> => {
	const supabase = await createClient()
	const { storeId } = await getPublicStoreContext()

	const { data, error } = await supabase
		.from('stores')
		.select('name, tagline, description, address, founded_year, rut')
		.eq('id', storeId)
		.maybeSingle()

	if (error || !data) {
		if (error) console.error('[getStoreInfo]', error)
		return FALLBACK
	}

	return {
		name: data.name,
		tagline: data.tagline,
		description: data.description,
		address: data.address,
		founded_year: data.founded_year,
		rut: data.rut,
	}
})
