'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/services/admin-context'

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

export async function createCategory(formData: any) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { message: 'Unauthorized', error: true }

	try {
		const slug = formData.slug || generateSlug(formData.name)

		const { data, error } = await supabase
			.from('categories')
			.insert({
				store_id: store.id,
				name: formData.name,
				slug: slug,
				description: formData.description || null,
				image_url: formData.image || null,
			} as any)
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/categories')
		revalidatePath('/admin/products') // If products list shows category names
		return { message: 'Categoría creada exitosamente', error: false }
	} catch (e: any) {
		console.error('Error creating category:', e)
		return {
			message: e.message || 'Error al crear la categoría',
			error: true,
		}
	}
}

export async function updateCategory(id: string, formData: any) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { message: 'Unauthorized', error: true }

	try {
		const updates: any = {
			name: formData.name,
			description: formData.description || null,
			image_url: formData.image || null,
		}

		// Only update slug if explicitly changed to avoid breaking SEO links unnecessarily,
		// or if we decide slug follows name always. Let's update slug if name changes or specific slug provided.
		if (formData.slug) {
			updates.slug = formData.slug
		} else if (formData.name) {
			updates.slug = generateSlug(formData.name)
		}

		const { error } = await (supabase.from('categories') as any)
			.update(updates)
			.eq('store_id', store.id)
			.eq('id', id)

		if (error) throw error

		revalidatePath('/admin/categories')
		revalidatePath('/admin/products')
		return {
			message: 'Categoría actualizada exitosamente',
			error: false,
		}
	} catch (e: any) {
		console.error('Error updating category:', e)
		return {
			message: e.message || 'Error al actualizar la categoría',
			error: true,
		}
	}
}

export async function deleteCategory(id: string) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { message: 'Unauthorized', error: true }

	try {
		const { error } = await supabase
			.from('categories')
			.delete()
			.eq('store_id', store.id)
			.eq('id', id)

		if (error) throw error

		revalidatePath('/admin/categories')
		return { message: 'Categoría eliminada', error: false }
	} catch (e: any) {
		console.error('Error deleting category:', e)
		return { message: e.message || 'Error al eliminar', error: true }
	}
}
