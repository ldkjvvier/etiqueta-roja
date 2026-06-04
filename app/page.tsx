import { Suspense } from 'react'
import { Header } from '@/components/header'
import { AnnouncementBar } from '@/components/announcement-bar'
import { PromoBanner } from '@/components/promo-banner'
import { Hero } from '@/components/hero'
import { ProductGridSection } from '@/components/product-grid-section'
import { ProductGridSkeleton } from '@/components/product-grid-skeleton'
import { Footer } from '@/components/footer'

export default function Home({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>
}) {
	return (
		<div className="min-h-screen flex flex-col">
			<PromoBanner />
			<Header />
			<AnnouncementBar />
			<main id="main-content" tabIndex={-1} className="flex-1">
				<Hero />
				{/* Hero y header pintan de inmediato; solo el grid espera el fetch */}
				<Suspense fallback={<ProductGridSkeleton />}>
					<ProductGridSection searchParams={searchParams} />
				</Suspense>
			</main>
			<Footer />
		</div>
	)
}
