import { Header } from '@/components/header'
import { PromoBanner } from '@/components/promo-banner'
import { Hero } from '@/components/hero'
import { ProductGrid } from '@/components/product-grid'
import { Footer } from '@/components/footer'

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col">
			<PromoBanner />
			<Header />
			<main className="flex-1">
				<Hero />
				<ProductGrid />
			</main>
			<Footer />
		</div>
	)
}
