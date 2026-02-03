'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: any) {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { message: 'Unauthorized', error: true }

	try {
		// 1. Create Product
		const { data: productData, error: productError } = await supabase
			.from('products')
			.insert({
				name: formData.name,
				description: formData.description,
				price: parseFloat(formData.price),
				original_price: formData.original_price
					? parseFloat(formData.original_price)
					: null,
				category_id: formData.category_id,
				image: formData.image,
				images: formData.images || [],
				created_at: new Date().toISOString(),
			} as any)
			.select()
			.single()

		const product = productData as any

		if (productError) throw productError

		// 2. Create Variants
		if (formData.variants && formData.variants.length > 0) {
			const variantsData = formData.variants.map((v: any) => ({
				product_id: product.id,
				size: v.size,
				stock_quantity: parseInt(v.stock_quantity),
				sku: v.sku || null,
			}))

			const { error: variantsError } = await supabase
				.from('product_variants')
				.insert(variantsData as any)

			if (variantsError) throw variantsError
		}

		revalidatePath('/admin/products')
		revalidatePath('/') // Clear cache for frontend
		return {
			message: 'Producto creado exitosamente',
			error: false,
			id: product.id,
		}
	} catch (e: any) {
		console.error('Error creating product:', e)
		return {
			message: e.message || 'Error creating product',
			error: true,
		}
	}
}

export async function updateProduct(id: string, formData: any) {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { message: 'Unauthorized', error: true }

	try {
		// 1. Update Product Base Info
		const { error: productError } = await (
			supabase.from('products') as any
		)
			.update({
				name: formData.name,
				description: formData.description,
				price: parseFloat(formData.price),
				original_price: formData.original_price
					? parseFloat(formData.original_price)
					: null,
				category_id: formData.category_id,
				image: formData.image,
				images: formData.images || [],
				// Don't update created_at
			})
			.eq('id', id)
			.select()
			.single()

		if (productError) throw productError

		// 2. Manage Variants
		// Fetch existing
		const { data: existingVariants, error: fetchVariantsError } =
			await supabase
				.from('product_variants')
				.select('id')
				.eq('product_id', id)

		if (fetchVariantsError) throw fetchVariantsError

		const existingIds =
			(existingVariants as any[])?.map((v) => v.id) || []
		const incomingIds = formData.variants
			.map((v: any) => v.id)
			.filter(Boolean)
		const toDeleteIds = existingIds.filter(
			(id) => !incomingIds.includes(id),
		)

		// Delete removed
		if (toDeleteIds.length > 0) {
			const { error: deleteError } = await supabase
				.from('product_variants')
				.delete()
				.in('id', toDeleteIds)
			if (deleteError) throw deleteError
		}

		// Upsert (Update or Insert)
		const variantsToUpsert = formData.variants.map((v: any) => ({
			id: v.id || undefined, // If undefined, Supabase will generate new UUID
			product_id: id,
			size: v.size,
			stock_quantity: parseInt(v.stock_quantity),
			sku: v.sku || null,
		}))

		if (variantsToUpsert.length > 0) {
			const { error: variantsError } = await supabase
				.from('product_variants')
				.upsert(variantsToUpsert as any)

			if (variantsError) throw variantsError
		}

		revalidatePath('/admin/products')
		revalidatePath(`/admin/products/${id}`)
		revalidatePath(`/producto/${id}`)
		revalidatePath('/')

		return {
			message: 'Producto actualizado exitosamente',
			error: false,
		}
	} catch (e: any) {
		console.error('Error updating product:', e)
		return {
			message: e.message || 'Error updating product',
			error: true,
		}
	}
}
