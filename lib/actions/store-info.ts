'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/data/admin-context'
import type { TablesUpdate } from '@/lib/supabase/types'
import { z } from 'zod'

const MIN_FOUNDED_YEAR = 1900

const storeInfoSchema = z.object({
	name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
	foundedYear: z
		.number({ invalid_type_error: 'El año debe ser un número' })
		.int()
		.min(MIN_FOUNDED_YEAR, `El año debe ser ${MIN_FOUNDED_YEAR} o posterior`)
		.refine(
			(y) => y <= new Date().getFullYear(),
			{ message: `El año no puede ser futuro` },
		),
	tagline: z.string().trim().max(120).optional(),
	description: z.string().trim().max(300).optional(),
	address: z.string().trim().max(200).optional(),
	rut: z.string().trim().max(20).optional(),
})

export async function updateStoreInfo(
	_prevState: unknown,
	formData: FormData,
) {
	const rawFoundedYear = formData.get('founded_year')
	const parsed = storeInfoSchema.safeParse({
		name: String(formData.get('name') || ''),
		foundedYear: rawFoundedYear ? Number(rawFoundedYear) : undefined,
		tagline: String(formData.get('tagline') || ''),
		description: String(formData.get('description') || ''),
		address: String(formData.get('address') || ''),
		rut: String(formData.get('rut') || ''),
	})

	if (!parsed.success) {
		return {
			message:
				parsed.error.errors[0]?.message ??
				'Revisa los datos de identidad de la tienda',
			error: true,
		}
	}

	const supabase = await createClient()
	const { storeId } = await getAdminStoreContext()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	const payload: TablesUpdate<'stores'> = {
		name: parsed.data.name,
		founded_year: parsed.data.foundedYear,
		tagline: parsed.data.tagline || null,
		description: parsed.data.description || null,
		address: parsed.data.address || null,
		rut: parsed.data.rut || null,
	}

	const { error } = await supabase
		.from('stores')
		.update(payload)
		.eq('id', storeId)

	if (error) {
		console.error('[updateStoreInfo]', error)
		return { message: 'No se pudo guardar la identidad de la tienda', error: true }
	}

	revalidatePath('/admin/config')
	revalidatePath('/', 'layout')
	return { message: 'Identidad de la tienda guardada', error: false }
}
