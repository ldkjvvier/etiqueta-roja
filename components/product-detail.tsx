'use client'

import {
	useState,
	useCallback,
	useEffect,
	useMemo,
	useId,
	type ReactNode,
} from 'react'
import Link from 'next/link'
import {
	ArrowLeft,
	Share2,
	Plus,
	ShieldCheck,
	ShoppingBag,
	Truck,
	Repeat2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore, type Product } from '@/lib/store-context'
import { formatPrice, cn } from '@/lib/utils'
import { ViewTracker } from '@/components/view-tracker'
import { ProductStickyCtaMobile } from '@/components/product-detail-sticky-cta'
import { CollapsibleDescription } from '@/components/collapsible-description'
import { RelatedProducts } from '@/components/related-products'
import {
	ProductGallery,
	type GalleryFocusRequest,
} from '@/components/product-gallery'

/* ────────────────────────────────────────────────────────────────────────
   Bloques estáticos de información (envíos, cambios, cómo comprar).
   El contenido es genérico a propósito: la coordinación real ocurre por
   WhatsApp, por eso no se prometen plazos ni montos específicos.
   ──────────────────────────────────────────────────────────────────────── */

const INFO_SECTIONS: Array<{ title: string; content: ReactNode }> = [
	{
		title: 'Envío y entrega',
		content: (
			<p>
				Al confirmar tu pedido por WhatsApp coordinamos el envío o el
				retiro directamente contigo. Te confirmamos costo y tiempos
				antes de cerrar la compra — sin sorpresas.
			</p>
		),
	},
	{
		title: 'Cambios y devoluciones',
		content: (
			<p>
				¿La talla no te quedó? Escríbenos por WhatsApp y coordinamos
				el cambio, sujeto a disponibilidad de stock. Las piezas son
				limitadas: si tienes dudas con la talla, pregúntanos antes de
				pedir.
			</p>
		),
	},
	{
		title: 'Cómo comprar',
		content: (
			<ol className="space-y-3">
				{[
					'Elige tu talla y agrega el producto al carrito.',
					'En el carrito ingresa tu correo para registrar el pedido.',
					'Confirma: se abre WhatsApp con tu pedido armado y coordinamos pago y entrega.',
				].map((step, index) => (
					<li key={index} className="flex gap-3">
						<span className="shrink-0 font-mono text-[10px] font-bold tracking-widest text-primary-strong">
							0{index + 1}
						</span>
						<span>{step}</span>
					</li>
				))}
			</ol>
		),
	},
]

const TRUST_SIGNALS = [
	{ icon: ShieldCheck, label: 'Stock real verificado' },
	{ icon: Truck, label: 'Entrega coordinada contigo' },
	{ icon: Repeat2, label: 'Cambio de talla por WhatsApp' },
] as const

/** Disclosure accesible: botón + región con apertura animada.
    Reemplaza a <details>/<summary>, cuya expansión instantánea producía un
    salto brusco de layout al abrir secciones como "Cómo comprar". */
function InfoDisclosure({
	title,
	children,
}: {
	title: string
	children: ReactNode
}) {
	const [open, setOpen] = useState(false)
	const contentId = useId()

	return (
		<div className="border-b border-border">
			<button
				type="button"
				aria-expanded={open}
				aria-controls={contentId}
				onClick={() => setOpen((value) => !value)}
				className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-mono text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-primary-strong"
			>
				{title}
				<Plus
					className={cn(
						'h-4 w-4 shrink-0 transition-transform duration-200',
						open && 'rotate-45',
					)}
					aria-hidden="true"
				/>
			</button>
			{/* grid-rows 0fr→1fr: expansión suave sin animar height (sin reflow
			    por frame). inert saca el contenido cerrado del tab order. */}
			<div
				id={contentId}
				inert={!open}
				className={cn(
					'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
					open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
				)}
			>
				<div className="overflow-hidden">
					<div className="pb-5 text-sm leading-relaxed text-muted-foreground">
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}

export function ProductDetail({
	product,
	relatedProducts = [],
}: {
	product: Product
	relatedProducts?: Product[]
}) {
	const [selectedSize, setSelectedSize] = useState<string | null>(null)
	const [galleryFocus, setGalleryFocus] =
		useState<GalleryFocusRequest | null>(null)
	const [canShare, setCanShare] = useState(false)

	useEffect(() => {
		setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
	}, [])
	const { addToCart } = useStore()

	const isSoldOut = product.stockStatus === 'sold_out'

	const normalizeImageUrl = useCallback((url: string) => {
		try {
			const parsed = new URL(url)
			parsed.search = ''
			parsed.hash = ''
			return parsed.toString()
		} catch {
			return url
		}
	}, [])

	// Combina imagen principal + galería + imágenes de variantes para que
	// seleccionar una talla pueda enfocar su foto.
	const productImages = useMemo(() => {
		const variantImages = (product.variants || [])
			.map((variant) => variant.imageUrl)
			.filter((image): image is string => Boolean(image))

		const allImages = [
			product.image,
			...(product.images || []),
			...variantImages,
		]
		const validImages = allImages.filter((img): img is string =>
			Boolean(img),
		)

		const uniqueByNormalized = new Map<string, string>()
		for (const image of validImages) {
			const normalized = normalizeImageUrl(image)
			if (!uniqueByNormalized.has(normalized)) {
				uniqueByNormalized.set(normalized, image)
			}
		}

		const uniqueImages = Array.from(uniqueByNormalized.values())
		return uniqueImages.length > 0 ? uniqueImages : ['/placeholder.svg']
	}, [product.image, product.images, product.variants, normalizeImageUrl])

	const selectedVariant = selectedSize
		? product.variants?.find((variant) => variant.size === selectedSize)
		: null
	const displayedPrice =
		selectedVariant?.price !== null &&
		selectedVariant?.price !== undefined
			? selectedVariant.price
			: product.price

	const discountPercent =
		product.originalPrice && product.originalPrice > displayedPrice
			? Math.round(
					(1 - displayedPrice / product.originalPrice) * 100,
				)
			: null

	// Ficha técnica — datos reales disponibles del producto
	const displayedSku =
		selectedVariant?.sku ?? product.variants?.[0]?.sku ?? null
	const refCode = product.id.slice(0, 8).toUpperCase()

	// El mensaje de drop/escasez solo aplica si el producto pertenece a un
	// drop que ya está abierto — no todos los productos son de drop.
	const liveDrop =
		product.drop && product.drop.status === 'live' ? product.drop : null
	const availabilityLabel = isSoldOut
		? 'Agotado'
		: product.stockStatus === 'low'
			? 'Últimas unidades'
			: 'En stock'

	const focusVariantImage = useCallback(
		(variantImageUrl?: string | null) => {
			if (!variantImageUrl) return

			const targetNormalized = normalizeImageUrl(variantImageUrl)
			const index = productImages.findIndex(
				(imageUrl) => normalizeImageUrl(imageUrl) === targetNormalized,
			)

			if (index >= 0) {
				// Objeto nuevo en cada pedido: re-seleccionar la misma talla
				// vuelve a desplazar la galería hacia su foto.
				setGalleryFocus({ index })
			}
		},
		[normalizeImageUrl, productImages],
	)

	const handleToggleSize = useCallback(
		(size: string) => {
			if (selectedSize === size) {
				setSelectedSize(null)
				return
			}

			setSelectedSize(size)
			const variant = product.variants?.find(
				(item) => item.size === size,
			)
			focusVariantImage(variant?.imageUrl)
		},
		[focusVariantImage, product.variants, selectedSize],
	)

	// A-03: auto-seleccionar si hay exactamente 1 talla disponible
	useEffect(() => {
		const availableSizes = product.sizes.filter((size) => {
			const variant = product.variants?.find((v) => v.size === size)
			return (
				!variant ||
				variant.trackInventory === false ||
				variant.stock > 0
			)
		})
		if (availableSizes.length === 1) {
			setSelectedSize(availableSizes[0])
		}
		// Solo al montar o cambiar de producto — product.sizes y variants son inmutables en SSR
	}, [product.id])

	const handleAddToCart = () => {
		if (!selectedSize) return

		const maxStock = selectedVariant?.stock ?? 0

		const unitPrice =
			selectedVariant?.price !== null &&
			selectedVariant?.price !== undefined
				? selectedVariant.price
				: product.price

		addToCart({
			id: product.id,
			name: product.name,
			price: unitPrice,
			size: selectedSize,
			variantId: selectedVariant?.id,
			combinationKey: selectedVariant?.combinationKey,
			image: selectedVariant?.imageUrl || product.image,
			maxStock,
		})
	}

	return (
		<div className="bg-background pb-24 lg:pb-0">
			<ViewTracker productId={product.id} />

			{/* Barra técnica: breadcrumb + referencia */}
			<div className="border-b border-border">
				<div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
					<nav
						className="flex min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em]"
						aria-label="Breadcrumb"
					>
						<Link
							href="/"
							className="flex shrink-0 items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
						>
							<ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
							<span>Inicio</span>
						</Link>
						<span className="text-border-strong" aria-hidden="true">
							/
						</span>
						<Link
							href="/#stock"
							className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
						>
							Stock
						</Link>
						<span className="text-border-strong" aria-hidden="true">
							/
						</span>
						<span className="truncate font-bold">{product.name}</span>
					</nav>
					<span className="hidden shrink-0 font-mono text-[10px] tracking-[0.25em] text-muted-foreground sm:block">
						REF {refCode}
					</span>
				</div>
			</div>

			{/* Layout asimétrico 7/5 con costura central */}
			<div className="container mx-auto px-4">
				<div className="grid lg:grid-cols-12">
					{/* ── Galería: rail con snap en mobile, mosaico en desktop ── */}
					<div className="py-6 lg:col-span-7 lg:border-r lg:border-border lg:py-10 lg:pr-10">
						<ProductGallery
							images={productImages}
							productName={product.name}
							isSoldOut={isSoldOut}
							isLowStock={product.stockStatus === 'low'}
							discountPercent={discountPercent}
							focusRequest={galleryFocus}
						/>
					</div>

					{/* ── Panel de información ── */}
					<div className="flex flex-col py-6 lg:col-span-5 lg:py-10 lg:pl-10">
						{/* Kicker: categoría (+ drop abierto) + compartir */}
						<div className="mb-4 flex items-center justify-between gap-3">
							<div className="flex min-w-0 flex-wrap items-center gap-2">
								<p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-strong">
									// {product.category || 'Stock'}
								</p>
								{liveDrop && (
									<span className="bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground">
										Drop · {liveDrop.name}
									</span>
								)}
							</div>
							{canShare && (
								<button
									type="button"
									onClick={() => {
										navigator
											.share({
												title: product.name,
												text: `Mirá este ${product.name} en Etiqueta Roja`,
												url: window.location.href,
											})
											.catch(() => {})
									}}
									className="flex h-11 w-11 shrink-0 items-center justify-center border border-border transition-colors hover:border-foreground"
									aria-label="Compartir producto"
								>
									<Share2 className="h-4 w-4" aria-hidden="true" />
								</button>
							)}
						</div>

						{/* Título editorial */}
						<h1 className="font-editorial text-4xl font-extrabold uppercase leading-[0.92] tracking-tight md:text-5xl lg:text-6xl">
							{product.name}
						</h1>

						{/* Bloque de precio */}
						<div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-5">
							<span className="text-3xl font-black tabular-nums md:text-4xl">
								{formatPrice(displayedPrice)}
							</span>
							{product.originalPrice && (
								<span className="text-lg tabular-nums text-muted-foreground line-through">
									{formatPrice(product.originalPrice)}
								</span>
							)}
							{discountPercent && (
								<span className="font-mono text-xs font-bold uppercase tracking-widest text-primary-strong">
									Ahorras {discountPercent}%
								</span>
							)}
						</div>

						{/* Selector de talla */}
						{!isSoldOut && (
							<div className="mt-6">
								<div className="mb-3 flex items-baseline justify-between">
									<h3
										id="size-selector-label"
										className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
									>
										Selecciona tu talla
									</h3>
									{selectedSize && (
										<span className="font-mono text-[10px] uppercase tracking-[0.2em]">
											Talla {selectedSize}
										</span>
									)}
								</div>
								<div
									className="flex flex-wrap gap-2"
									role="group"
									aria-labelledby="size-selector-label"
								>
									{product.sizes.map((size) => {
										const variant = product.variants?.find(
											(v) => v.size === size,
										)
										const isSizeSoldOut = variant
											? variant.trackInventory !== false &&
												variant.stock <= 0
											: false
										const isSizeLow =
											!isSizeSoldOut &&
											variant &&
											variant.trackInventory !== false &&
											variant.stock > 0 &&
											variant.stock <=
												(variant.lowStockThreshold ?? 5)

										return (
											<button
												key={size}
												type="button"
												disabled={isSizeSoldOut}
												onClick={() => handleToggleSize(size)}
												aria-pressed={selectedSize === size}
												aria-label={`Talla ${size}${
													isSizeSoldOut
														? ' agotada'
														: isSizeLow
															? ' — pocas unidades'
															: ''
												}`}
												className={`relative h-12 min-w-14 border-2 px-3 text-sm font-bold transition-all ${
													selectedSize === size
														? 'border-foreground bg-foreground text-background'
														: isSizeSoldOut
															? 'cursor-not-allowed border-transparent bg-secondary text-muted-foreground line-through decoration-2 opacity-50'
															: 'border-border bg-transparent text-foreground hover:border-foreground'
												}`}
											>
												{size}
												{/* Punto rojo: talla con pocas unidades */}
												{isSizeLow && (
													<span
														className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${
															selectedSize === size
																? 'bg-background'
																: 'bg-primary'
														}`}
														aria-hidden="true"
													/>
												)}
											</button>
										)
									})}
								</div>
							</div>
						)}

						{/* A-05: Copy de escasez — visible al seleccionar una talla con poco stock */}
						{selectedVariant &&
							selectedVariant.trackInventory !== false &&
							selectedVariant.stock > 0 &&
							selectedVariant.stock <=
								(selectedVariant.lowStockThreshold ?? 5) && (
								<p
									role="status"
									className="mt-4 font-mono text-xs uppercase tracking-widest text-primary-strong"
								>
									{selectedVariant.stock === 1
										? 'Solo queda 1 unidad'
										: `Solo quedan ${selectedVariant.stock} unidades`}
								</p>
							)}

						{/* CTA — el pedido por WhatsApp se confirma desde el carrito,
						    donde se pide el correo y se registra la orden. */}
						<div className="mt-6 space-y-3">
							{!isSoldOut ? (
								<>
									<Button
										onClick={handleAddToCart}
										disabled={!selectedSize}
										className="h-14 w-full gap-3 bg-primary font-mono text-sm font-bold uppercase tracking-[0.15em] text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 lg:text-base"
									>
										<ShoppingBag className="h-5 w-5" aria-hidden="true" />
										{selectedSize
											? 'Agregar al carrito'
											: 'Selecciona tu talla'}
									</Button>
									<p className="text-center text-xs text-muted-foreground">
										Desde el carrito confirmas el pedido y se abre
										WhatsApp para coordinar pago y entrega.
									</p>
								</>
							) : (
								<Button
									disabled
									className="h-14 w-full cursor-not-allowed font-mono text-base font-bold uppercase tracking-[0.15em] opacity-50"
								>
									Agotado
								</Button>
							)}
						</div>

						{/* Señales de confianza */}
						<div className="mt-8 grid grid-cols-3 divide-x divide-border border-y border-border">
							{TRUST_SIGNALS.map(({ icon: Icon, label }) => (
								<div
									key={label}
									className="flex flex-col items-center gap-2 px-2 py-4 text-center"
								>
									<Icon
										className="h-4 w-4 text-primary-strong"
										aria-hidden="true"
									/>
									<span className="font-mono text-[9px] uppercase leading-tight tracking-[0.12em] text-muted-foreground">
										{label}
									</span>
								</div>
							))}
						</div>

						{/* Descripción */}
						{product.description?.trim() ? (
							<div className="mt-8">
								<h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
									Notas del drop
								</h3>
								<CollapsibleDescription text={product.description} />
							</div>
						) : null}

						{/* Ficha técnica */}
						<div className="mt-8">
							<h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
								Ficha técnica
							</h3>
							<dl className="divide-y divide-border border border-border font-mono text-xs">
								<div className="flex items-center justify-between gap-4 px-4 py-3">
									<dt className="uppercase tracking-[0.15em] text-muted-foreground">
										Categoría
									</dt>
									<dd className="font-bold uppercase tracking-wide">
										{product.category || '—'}
									</dd>
								</div>
								{liveDrop && (
									<div className="flex items-center justify-between gap-4 px-4 py-3">
										<dt className="uppercase tracking-[0.15em] text-muted-foreground">
											Drop
										</dt>
										<dd className="text-right font-bold uppercase tracking-wide text-primary-strong">
											{liveDrop.name}
										</dd>
									</div>
								)}
								<div className="flex items-center justify-between gap-4 px-4 py-3">
									<dt className="uppercase tracking-[0.15em] text-muted-foreground">
										Tallas
									</dt>
									<dd className="text-right font-bold uppercase tracking-wide">
										{product.sizes.join(' / ') || '—'}
									</dd>
								</div>
								<div className="flex items-center justify-between gap-4 px-4 py-3">
									<dt className="uppercase tracking-[0.15em] text-muted-foreground">
										Disponibilidad
									</dt>
									<dd
										className={`font-bold uppercase tracking-wide ${
											isSoldOut
												? 'text-muted-foreground'
												: product.stockStatus === 'low'
													? 'text-primary-strong'
													: ''
										}`}
									>
										{availabilityLabel}
									</dd>
								</div>
								{displayedSku && (
									<div className="flex items-center justify-between gap-4 px-4 py-3">
										<dt className="uppercase tracking-[0.15em] text-muted-foreground">
											SKU
										</dt>
										<dd className="font-bold uppercase tracking-wide">
											{displayedSku}
										</dd>
									</div>
								)}
								<div className="flex items-center justify-between gap-4 px-4 py-3">
									<dt className="uppercase tracking-[0.15em] text-muted-foreground">
										Ref
									</dt>
									<dd className="font-bold uppercase tracking-wide">
										{refCode}
									</dd>
								</div>
							</dl>
						</div>

						{/* Información de compra */}
						<div className="mt-8 border-t border-border">
							{INFO_SECTIONS.map((section) => (
								<InfoDisclosure key={section.title} title={section.title}>
									{section.content}
								</InfoDisclosure>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Franja marquee — solo para productos de un drop abierto; el resto
			    del catálogo no es de stock limitado y lleva un divisor simple. */}
			{liveDrop ? (
				<div
					className="overflow-hidden border-y border-border py-3"
					aria-hidden="true"
				>
					<div className="flex w-max animate-announcement-marquee motion-reduce:animate-none">
						{[0, 1].map((half) => (
							<div key={half} className="flex shrink-0 items-center">
								{Array.from({ length: 4 }).map((_, i) => (
									<span
										key={i}
										className="flex items-center gap-6 whitespace-nowrap pr-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
									>
										<span className="font-bold text-foreground">
											{product.name}
										</span>
										<span className="text-primary-strong">✕</span>
										<span className="font-bold text-primary-strong">
											Drop {liveDrop.name} abierto
										</span>
										<span className="text-primary-strong">✕</span>
										<span>Stock limitado</span>
										<span className="text-primary-strong">✕</span>
										<span>Una vez agotado no vuelve</span>
										<span className="text-primary-strong">✕</span>
									</span>
								))}
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="border-t border-border" />
			)}

			{/* Productos relacionados */}
			<RelatedProducts products={relatedProducts} />

			{/* A-01: Sticky CTA — solo visible en mobile (lg:hidden en el componente) */}
			<ProductStickyCtaMobile
				price={displayedPrice}
				selectedSize={selectedSize}
				disabled={!selectedSize}
				isSoldOut={isSoldOut}
				onAddToCart={handleAddToCart}
			/>
		</div>
	)
}
