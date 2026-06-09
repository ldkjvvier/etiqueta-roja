import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/header'
import { AnnouncementBar } from '@/components/announcement-bar'
import { PromoBanner } from '@/components/promo-banner'
import { Footer } from '@/components/footer'
import { ProductDetail } from '@/components/product-detail'
import {
	getProduct,
	getProductBySlug,
	getRelatedProducts,
} from '@/lib/services/products-server'

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveProduct(id: string) {
	return UUID_REGEX.test(id)
		? await getProduct(id)
		: await getProductBySlug(id)
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	const { id } = await params
	const product = await resolveProduct(id)
	if (!product) return { title: 'Producto | ETIQUETA ROJA' }

	const description =
		product.description ||
		`Comprá ${product.name} en ETIQUETA ROJA. Stock limitado.`

	return {
		title: `${product.name} | ETIQUETA ROJA`,
		description,
		openGraph: {
			title: `${product.name} | ETIQUETA ROJA`,
			description,
			images: product.image
				? [{ url: product.image, width: 1200, height: 1200, alt: product.name }]
				: [],
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: `${product.name} | ETIQUETA ROJA`,
			description,
			images: product.image ? [product.image] : [],
		},
	}
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const isUUID = UUID_REGEX.test(id)
	const product = await resolveProduct(id)

	if (!product) {
		notFound()
	}

	if (isUUID && product.slug && product.slug !== id) {
		redirect(`/producto/${product.slug}`)
	}

	const relatedProducts = await getRelatedProducts(product.id)

	return (
		<div className="min-h-screen flex flex-col">
			<AnnouncementBar />
			<PromoBanner />
			<Header />
			<main id="main-content" tabIndex={-1} className="flex-1">
				<ProductDetail
					product={product}
					relatedProducts={relatedProducts}
				/>
			</main>
			<Footer />
		</div>
	)
}
