import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { PromoBanner } from '@/components/promo-banner'
import { Footer } from '@/components/footer'
import { ProductDetail } from '@/components/product-detail'
import {
	getProduct,
	getRelatedProducts,
} from '@/lib/services/products-server'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	const { id } = await params
	const product = await getProduct(id)
	if (!product) return { title: 'Producto | ETIQUETA ROJA' }

	return {
		title: `${product.name} | ETIQUETA ROJA`,
		description:
			product.description ||
			`Comprá ${product.name} en ETIQUETA ROJA. Stock limitado.`,
	}
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const product = await getProduct(id)

	if (!product) {
		notFound()
	}

	const relatedProducts = await getRelatedProducts(id)

	return (
		<div className="min-h-screen flex flex-col">
			<PromoBanner />
			<Header />
			<main className="flex-1">
				<ProductDetail
					product={product}
					relatedProducts={relatedProducts}
				/>
			</main>
			<Footer />
		</div>
	)
}
