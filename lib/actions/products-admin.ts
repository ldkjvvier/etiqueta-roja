'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/services/admin-context'

type ProductVariantInput = {
	id?: string
	size: string
	stock_quantity: number
	reserved_stock?: number
	low_stock_threshold?: number
	sku?: string | null
}

type ProductMutationPayload = {
	name: string
	description?: string | null
	base_price: number
	compare_at_price?: number | null
	category_id?: string | null
	drop_id?: string | null
	status?: 'draft' | 'active' | 'archived'
	is_customizable?: boolean
	images: string[]
	variants: ProductVariantInput[]
}

function normalizeText(input: string) {
	return input
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
}

function slugify(name: string) {
	return normalizeText(name)
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
}

function normalizeVariantValue(value: string) {
	return normalizeText(value).replace(/\s+/g, '-')
}

function buildCombinationKey(
	optionName: string,
	optionValue: string,
) {
	return `${normalizeVariantValue(optionName)}:${normalizeVariantValue(optionValue)}`
}

function validateVariants(variants: ProductVariantInput[]) {
	if (!variants.length) {
		throw new Error('Debe existir al menos una variante')
	}

	const seen = new Set<string>()
	for (const variant of variants) {
		const key = buildCombinationKey('size', variant.size)
		if (seen.has(key)) {
			throw new Error(`Variante duplicada detectada: ${variant.size}`)
		}
		seen.add(key)

		const stock = Number(variant.stock_quantity || 0)
		const reserved = Number(variant.reserved_stock || 0)
		if (reserved > stock) {
			throw new Error(
				`reserved_stock no puede ser mayor a stock_quantity en ${variant.size}`,
			)
		}
	}
}

async function ensureUniqueSlug(
	supabase: any,
	storeId: string,
	name: string,
	excludingProductId?: string,
) {
	const base = slugify(name)
	let candidate = base
	let attempt = 1

	while (true) {
		let request = supabase
			.from('products')
			.select('id')
			.eq('store_id', storeId)
			.eq('slug', candidate)
			.limit(1)

		if (excludingProductId) {
			request = request.neq('id', excludingProductId)
		}

		const { data, error } = await request
		if (error) throw error
		if (!data?.length) {
			return candidate
		}

		attempt += 1
		candidate = `${base}-${attempt}`
	}
}

async function replaceProductImages(
	supabase: any,
	productId: string,
	images: string[],
) {
	const gallery = images.slice(1)
	await supabase
		.from('product_images')
		.delete()
		.eq('product_id', productId)
	if (!gallery.length) return

	const rows = gallery.map((imageUrl, index) => ({
		product_id: productId,
		image_url: imageUrl,
		display_order: index,
	}))
	await supabase.from('product_images').insert(rows)
}

async function upsertVariantGraph(
	supabase: any,
	productId: string,
	variants: ProductVariantInput[],
) {
	validateVariants(variants)

	const { data: existingOption } = await supabase
		.from('product_options')
		.select('id')
		.eq('product_id', productId)
		.eq('name', 'Size')
		.limit(1)
		.maybeSingle()

	let optionId = existingOption?.id
	if (!optionId) {
		const { data: optionRow, error: optionError } = await supabase
			.from('product_options')
			.insert({
				product_id: productId,
				name: 'Size',
				position: 0,
			})
			.select('id')
			.limit(1)
			.single()

		if (optionError || !optionRow) {
			throw (
				optionError ||
				new Error('No se pudo asegurar product_option Size')
			)
		}

		optionId = optionRow.id
	}

	const finalOptionId = optionId
	if (!finalOptionId) {
		throw new Error('No se pudo resolver option_id de variantes')
	}

	const { data: existingVariants } = await supabase
		.from('product_variants')
		.select('id')
		.eq('product_id', productId)

	const { data: existingVariantsWithKeys } = await supabase
		.from('product_variants')
		.select('id,combination_key')
		.eq('product_id', productId)

	const existingByKey = new Map(
		(existingVariantsWithKeys ?? []).map((variant: any) => [
			variant.combination_key,
			variant.id,
		]),
	)

	const incomingCombinationKeys = new Set<string>()
	for (const variant of variants) {
		incomingCombinationKeys.add(
			buildCombinationKey('size', variant.size),
		)
	}

	const variantsToArchive = (existingVariantsWithKeys ?? [])
		.filter(
			(variant: any) =>
				!incomingCombinationKeys.has(variant.combination_key),
		)
		.map((variant: any) => variant.id)

	if (variantsToArchive.length) {
		await supabase
			.from('product_variants')
			.update({
				is_active: false,
				deleted_at: new Date().toISOString(),
			})
			.in('id', variantsToArchive)
	}

	for (const [index, variant] of variants.entries()) {
		const combinationKey = buildCombinationKey('size', variant.size)
		const currentVariantId =
			variant.id || existingByKey.get(combinationKey)
		const optionValueText = variant.size.trim()

		const { data: existingOptionValue } = await supabase
			.from('product_option_values')
			.select('id')
			.eq('option_id', finalOptionId)
			.eq('value', optionValueText)
			.limit(1)
			.maybeSingle()

		let optionValueId = existingOptionValue?.id
		if (!optionValueId) {
			const { data: optionValueRow, error: optionValueError } =
				await supabase
					.from('product_option_values')
					.insert({
						option_id: finalOptionId,
						value: optionValueText,
						position: index,
					})
					.select('id')
					.limit(1)
					.single()

			if (optionValueError || !optionValueRow) {
				throw (
					optionValueError ||
					new Error('No se pudo upsert option_value')
				)
			}

			optionValueId = optionValueRow.id
		} else {
			await supabase
				.from('product_option_values')
				.update({ position: index })
				.eq('id', optionValueId)
		}

		if (!optionValueId) {
			throw new Error('No se pudo resolver option_value_id')
		}

		const upsertPayload = {
			id: currentVariantId,
			product_id: productId,
			sku: variant.sku || null,
			combination_key: combinationKey,
			price: null,
			stock_quantity: Number(variant.stock_quantity || 0),
			reserved_stock: Number(variant.reserved_stock || 0),
			low_stock_threshold: Number(variant.low_stock_threshold ?? 5),
			track_inventory: true,
			is_active: true,
			deleted_at: null,
		}

		const { data: variantRow, error: variantError } = await supabase
			.from('product_variants')
			.upsert(upsertPayload as any)
			.select('id')
			.single()

		if (variantError || !variantRow) {
			throw variantError || new Error('No se pudo upsert variant')
		}

		await supabase
			.from('variant_option_values')
			.delete()
			.eq('variant_id', variantRow.id)

		await supabase.from('variant_option_values').insert({
			variant_id: variantRow.id,
			option_value_id: optionValueId,
		})
	}
}

export async function createProductV3(
	payload: ProductMutationPayload,
) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: true, message: 'Unauthorized' }

	try {
		if (!payload.images?.length) {
			throw new Error('Debe subir al menos una imagen')
		}

		const slug = await ensureUniqueSlug(db, store.id, payload.name)

		const { data: product, error } = await db
			.from('products')
			.insert({
				store_id: store.id,
				name: payload.name,
				slug,
				description: payload.description || null,
				base_price: Number(payload.base_price),
				compare_at_price: payload.compare_at_price
					? Number(payload.compare_at_price)
					: null,
				main_image: payload.images[0],
				category_id: payload.category_id || null,
				drop_id: payload.drop_id || null,
				status: payload.status || 'draft',
				is_customizable: Boolean(payload.is_customizable),
			} as any)
			.select('id')
			.single()

		if (error || !product) {
			throw error || new Error('No se pudo crear el producto')
		}

		await Promise.all([
			replaceProductImages(db, product.id, payload.images),
			upsertVariantGraph(db, product.id, payload.variants),
		])

		revalidatePath('/admin')
		revalidatePath('/admin/products')
		return {
			error: false,
			message: 'Producto creado',
			id: product.id,
		}
	} catch (error: any) {
		return {
			error: true,
			message: error?.message || 'Error creando producto',
		}
	}
}

export async function updateProductV3(
	id: string,
	payload: ProductMutationPayload,
) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: true, message: 'Unauthorized' }

	try {
		const slug = await ensureUniqueSlug(
			db,
			store.id,
			payload.name,
			id,
		)

		const { error } = await db
			.from('products')
			.update({
				name: payload.name,
				slug,
				description: payload.description || null,
				base_price: Number(payload.base_price),
				compare_at_price: payload.compare_at_price
					? Number(payload.compare_at_price)
					: null,
				main_image: payload.images[0],
				category_id: payload.category_id || null,
				drop_id: payload.drop_id || null,
				status: payload.status || 'draft',
				is_customizable: Boolean(payload.is_customizable),
				updated_at: new Date().toISOString(),
			} as any)
			.eq('id', id)
			.eq('store_id', store.id)
			.is('deleted_at', null)

		if (error) throw error

		await Promise.all([
			replaceProductImages(db, id, payload.images),
			upsertVariantGraph(db, id, payload.variants),
		])

		revalidatePath('/admin')
		revalidatePath('/admin/products')
		revalidatePath(`/admin/products/${id}`)
		return { error: false, message: 'Producto actualizado' }
	} catch (error: any) {
		return {
			error: true,
			message: error?.message || 'Error actualizando producto',
		}
	}
}

export async function archiveProductV3(id: string) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: true, message: 'Unauthorized' }

	const { error } = await db
		.from('products')
		.update({
			deleted_at: new Date().toISOString(),
			status: 'archived',
			updated_at: new Date().toISOString(),
		} as any)
		.eq('id', id)
		.eq('store_id', store.id)
		.is('deleted_at', null)

	if (error) {
		return { error: true, message: error.message }
	}

	revalidatePath('/admin')
	revalidatePath('/admin/products')
	return { error: false, message: 'Producto archivado' }
}

export async function toggleProductStatusV3(
	id: string,
	nextStatus: 'draft' | 'active' | 'archived',
) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: true, message: 'Unauthorized' }

	const { error } = await db
		.from('products')
		.update({
			status: nextStatus,
			updated_at: new Date().toISOString(),
		} as any)
		.eq('id', id)
		.eq('store_id', store.id)
		.is('deleted_at', null)

	if (error) {
		return { error: true, message: error.message }
	}

	revalidatePath('/admin/products')
	return { error: false, message: 'Estado actualizado' }
}

export async function bulkUpdateInventoryV3(
	entries: Array<{
		variantId: string
		stockQuantity: number
		reservedStock?: number
		lowStockThreshold?: number
	}>,
) {
	const supabase = await createClient()
	const db = supabase as any
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: true, message: 'Unauthorized' }

	for (const entry of entries) {
		if ((entry.reservedStock ?? 0) > entry.stockQuantity) {
			return {
				error: true,
				message: `reserved_stock no puede superar stock_quantity (${entry.variantId})`,
			}
		}
	}

	const rows = entries.map((entry) => ({
		id: entry.variantId,
		stock_quantity: entry.stockQuantity,
		reserved_stock: entry.reservedStock ?? 0,
		low_stock_threshold: entry.lowStockThreshold ?? 5,
	}))

	const { error } = await db
		.from('product_variants')
		.upsert(rows as any)
	if (error) {
		return { error: true, message: error.message }
	}

	revalidatePath('/admin/products')
	return { error: false, message: 'Inventario actualizado' }
}
