import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/header'
import { PromoBanner } from '@/components/promo-banner'
import { Footer } from '@/components/footer'
import { ProductDetail } from '@/components/product-detail'
import {
	getProduct,
	getProductBySlug,
	getRelatedProducts,
} from '@/lib/services/products-server'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	const { id } = await params
	const product = (await getProduct(id)) || (await getProductBySlug(id))
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
	const productById = await getProduct(id)
	const product = productById || (await getProductBySlug(id))

	if (!product) {
		notFound()
	}

	if (productById && product.slug && product.slug !== id) {
		redirect(`/producto/${product.slug}`)
	}

	const relatedProducts = await getRelatedProducts(product.id)

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
