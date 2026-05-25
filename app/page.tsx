import { Header } from '@/components/header'
import { AnnouncementBar } from '@/components/announcement-bar'
import { PromoBanner } from '@/components/promo-banner'
import { Hero } from '@/components/hero'
import { ProductGrid } from '@/components/product-grid'
import { Footer } from '@/components/footer'
import { getProducts } from '@/lib/services/products-server'

export default async function Home() {
	const products = await getProducts()

	return (
		<div className="min-h-screen flex flex-col">
			<AnnouncementBar />
			<PromoBanner />
			<Header />
			<main id="main-content" tabIndex={-1} className="flex-1">
				<Hero />
				<ProductGrid products={products} />
			</main>
			<Footer />
		</div>
	)
}
