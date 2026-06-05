import type { Metadata } from 'next'
import { PromoBanner } from '@/components/promo-banner'
import { Header } from '@/components/header'
import { AnnouncementBar } from '@/components/announcement-bar'
import { Footer } from '@/components/footer'
import { getProducts } from '@/lib/services/products-server'
import { SearchPageClient } from './search-page-client'

export const metadata: Metadata = {
	title: 'Buscar — ETIQUETA ROJA',
	description: 'Busca productos en ETIQUETA ROJA.',
}

interface Props {
	searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
	const { q = '' } = await searchParams
	const query = q.trim()

	const initialResults = await getProducts({ q: query, pageSize: 24 })

	return (
		<div className="min-h-screen flex flex-col">
			<PromoBanner />
			<Header />
			<AnnouncementBar />
			<SearchPageClient
				initialQuery={query}
				initialResults={initialResults}
			/>
			<Footer />
		</div>
	)
}
