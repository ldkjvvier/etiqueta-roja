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
import { createClient } from '@/lib/supabase/server'

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
	const isUUID = UUID_REGEX.test(id)
	const product = await resolveProduct(id)

	if (!product) {
		notFound()
	}

	if (isUUID && product.slug && product.slug !== id) {
		redirect(`/producto/${product.slug}`)
	}

	const [relatedProducts, supabase] = await Promise.all([
		getRelatedProducts(product.id),
		createClient(),
	])

	supabase.rpc('increment_product_view', { p_product_id: product.id })

	return (
		<div className="min-h-screen flex flex-col">
			<AnnouncementBar />
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
