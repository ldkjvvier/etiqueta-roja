import type { Metadata } from 'next'
import { PromoBanner } from '@/components/promo-banner'
import { Header } from '@/components/header'
import { AnnouncementBar } from '@/components/announcement-bar'
import { Footer } from '@/components/footer'
import {
	getSearchFacets,
	searchProducts,
	SEARCH_PAGE_SIZE,
} from '@/lib/services/products-server'
import {
	buildSearchQuery,
	parseSearchFilters,
} from '@/lib/search/filters'
import { SearchPageClient } from './search-page-client'

export const metadata: Metadata = {
	title: 'Buscar — ETIQUETA ROJA',
	description: 'Busca y filtra productos en ETIQUETA ROJA.',
}

interface Props {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({ searchParams }: Props) {
	const params = await searchParams
	const filters = parseSearchFilters(params)

	// La query string canónica actúa como key: si cambia, el grid del cliente
	// reinicia su acumulación de "cargar más".
	const filtersKey = buildSearchQuery(filters)

	const [initialResult, facets] = await Promise.all([
		searchProducts(filters, 1, SEARCH_PAGE_SIZE),
		getSearchFacets(),
	])

	return (
		<div className="min-h-screen flex flex-col">
			<PromoBanner />
			<Header />
			<AnnouncementBar />
			<SearchPageClient
				filtersKey={filtersKey}
				initialResult={initialResult}
				facets={facets}
				pageSize={SEARCH_PAGE_SIZE}
			/>
			<Footer />
		</div>
	)
}
