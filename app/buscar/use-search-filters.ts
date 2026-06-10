'use client'

import { useCallback, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
	buildSearchQuery,
	parseSearchFilters,
	type SearchFilters,
} from '@/lib/search/filters'

type FiltersUpdater =
	| Partial<SearchFilters>
	| ((prev: SearchFilters) => SearchFilters)

/**
 * La URL es la única fuente de verdad del estado de búsqueda. Este hook lee los
 * filtros desde los searchParams y los escribe con router.replace(scroll:false),
 * de modo que el refresco, el deep-link y el botón "atrás" del navegador
 * restauran el estado automáticamente.
 *
 * `isPending` proviene de useTransition: cubre el tiempo que tarda Next en
 * re-renderizar el Server Component con los resultados nuevos → lo usamos para
 * los skeletons/estado de carga sin condiciones de carrera (Next ordena y
 * descarta las navegaciones obsoletas por nosotros).
 */
export function useSearchFilters() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()
	const [isPending, startTransition] = useTransition()

	const filters = parseSearchFilters(searchParams)

	const apply = useCallback(
		(update: FiltersUpdater) => {
			const prev = parseSearchFilters(searchParams)
			const next: SearchFilters =
				typeof update === 'function'
					? update(prev)
					: { ...prev, ...update }
			const qs = buildSearchQuery(next)
			const url = qs ? `${pathname}?${qs}` : pathname
			startTransition(() => {
				router.replace(url, { scroll: false })
			})
		},
		[router, pathname, searchParams],
	)

	const clearAll = useCallback(() => {
		startTransition(() => {
			router.replace(pathname, { scroll: false })
		})
	}, [router, pathname])

	return { filters, apply, clearAll, isPending }
}
