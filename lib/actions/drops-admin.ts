'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/data/admin-context'

const DROP_STATUS_FLOW: Record<'scheduled' | 'live', 'live' | 'ended'> = {
	scheduled: 'live',
	live: 'ended',
}

type StatusActionResult = {
	error: boolean
	message: string
}

type DropMutationPayload = {
	name: string
	slug?: string | null
	description?: string | null
	cover_image?: string | null
	status?: 'scheduled' | 'live' | 'ended'
	start_time: string
	end_time?: string | null
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

function normalizeDateInput(input?: string | null) {
	if (!input) return null
	const date = new Date(input)
	if (Number.isNaN(date.getTime())) {
		throw new Error('Fecha inválida')
	}
	return date.toISOString()
}

async function ensureUniqueDropSlug(
	supabase: any,
	storeId: string,
	slugOrName: string,
	excludingDropId?: string,
) {
	const base = slugify(slugOrName)
	if (!base) {
		throw new Error('Slug inválido')
	}

	let candidate = base
	let attempt = 1

	while (true) {
		let request = supabase
			.from('drops')
			.select('id')
			.eq('store_id', storeId)
			.eq('slug', candidate)
			.limit(1)

		if (excludingDropId) {
			request = request.neq('id', excludingDropId)
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

function extractStoragePathFromPublicUrl(
	url: string,
	bucket: string,
) {
	try {
		const parsed = new URL(url)
		const marker = `/storage/v1/object/public/${bucket}/`
		const markerIndex = parsed.pathname.indexOf(marker)
		if (markerIndex === -1) return null

		const encodedPath = parsed.pathname.slice(
			markerIndex + marker.length,
		)
		const decodedPath = decodeURIComponent(encodedPath)
		return decodedPath || null
	} catch {
		return null
	}
}

export async function createDrop(payload: DropMutationPayload) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: true, message: 'Unauthorized' }

	try {
		const startTime = normalizeDateInput(payload.start_time)
		if (!startTime) {
			throw new Error('Debes indicar fecha de inicio')
		}

		const endTime = normalizeDateInput(payload.end_time)
		if (endTime && endTime <= startTime) {
			throw new Error('La fecha de fin debe ser mayor al inicio')
		}

		const slug = await ensureUniqueDropSlug(
			db,
			store.storeId,
			payload.slug || payload.name,
		)

		const { data, error } = await db
			.from('drops')
			.insert({
				store_id: store.storeId,
				name: payload.name,
				slug,
				description: payload.description || null,
				cover_image: payload.cover_image || null,
				status: payload.status || 'scheduled',
				start_time: startTime,
				end_time: endTime,
			} as any)
			.select('id')
			.single()

		if (error) {
			throw error
		}

		revalidatePath('/admin/drops')
		revalidatePath('/admin/products')
		return {
			error: false,
			message: 'Drop creado exitosamente',
			id: data?.id,
		}
	} catch (error: any) {
		return {
			error: true,
			message: error?.message || 'No se pudo crear el drop',
		}
	}
}

export async function updateDrop(
	id: string,
	payload: DropMutationPayload,
) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: true, message: 'Unauthorized' }

	try {
		const startTime = normalizeDateInput(payload.start_time)
		if (!startTime) {
			throw new Error('Debes indicar fecha de inicio')
		}

		const endTime = normalizeDateInput(payload.end_time)
		if (endTime && endTime <= startTime) {
			throw new Error('La fecha de fin debe ser mayor al inicio')
		}

		const slug = await ensureUniqueDropSlug(
			db,
			store.storeId,
			payload.slug || payload.name,
			id,
		)

		const { error } = await db
			.from('drops')
			.update({
				name: payload.name,
				slug,
				description: payload.description || null,
				cover_image: payload.cover_image || null,
				status: payload.status || 'scheduled',
				start_time: startTime,
				end_time: endTime,
			} as any)
			.eq('id', id)
			.eq('store_id', store.storeId)

		if (error) {
			throw error
		}

		revalidatePath('/admin/drops')
		revalidatePath(`/admin/drops/${id}`)
		revalidatePath('/admin/products')
		return {
			error: false,
			message: 'Drop actualizado exitosamente',
		}
	} catch (error: any) {
		return {
			error: true,
			message: error?.message || 'No se pudo actualizar el drop',
		}
	}
}

export async function deleteDrop(id: string) {
	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: true, message: 'Unauthorized' }

	try {
		const { data: drop, error: dropError } = await db
			.from('drops')
			.select('cover_image')
			.eq('id', id)
			.eq('store_id', store.storeId)
			.maybeSingle()

		if (dropError) throw dropError

		const { error } = await db
			.from('drops')
			.delete()
			.eq('id', id)
			.eq('store_id', store.storeId)

		if (error) throw error

		const storagePath = drop?.cover_image
			? extractStoragePathFromPublicUrl(drop.cover_image, 'products')
			: null

		let warning: string | null = null
		if (storagePath) {
			const { error: storageError } = await supabase.storage
				.from('products')
				.remove([storagePath])

			if (storageError) {
				warning =
					'Drop eliminado, pero la portada no pudo borrarse del bucket.'
			}
		}

		revalidatePath('/admin/drops')
		revalidatePath('/admin/products')
		return {
			error: false,
			message: warning || 'Drop eliminado exitosamente',
		}
	} catch (error: any) {
		return {
			error: true,
			message: error?.message || 'No se pudo eliminar el drop',
		}
	}
}

export async function advanceDropStatus(
	formData: FormData,
): Promise<StatusActionResult> {
	const dropId = String(formData.get('dropId') || '')
	if (!dropId) {
		return { error: true, message: 'Drop inválido' }
	}

	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		return { error: true, message: 'Unauthorized' }
	}

	try {
		const { data: drop, error: dropError } = await db
			.from('drops')
			.select('id,status,start_time,end_time')
			.eq('id', dropId)
			.eq('store_id', store.storeId)
			.maybeSingle()

		if (dropError) {
			throw dropError
		}

		if (!drop) {
			return { error: true, message: 'Drop no encontrado' }
		}

		if (drop.status === 'ended') {
			return {
				error: false,
				message: 'El drop ya está cerrado',
			}
		}

		const currentStatus = drop.status as 'scheduled' | 'live'
		const nextStatus = DROP_STATUS_FLOW[currentStatus]
		if (!nextStatus) {
			return {
				error: true,
				message: 'Estado de drop inválido',
			}
		}

		const nowIso = new Date().toISOString()
		const updates: Record<string, unknown> = {
			status: nextStatus,
		}

		if (currentStatus === 'scheduled' && nextStatus === 'live') {
			updates.start_time = drop.start_time || nowIso
		}
		if (currentStatus === 'live' && nextStatus === 'ended') {
			updates.end_time = drop.end_time || nowIso
		}

		const { error: updateError } = await db
			.from('drops')
			.update(updates)
			.eq('id', dropId)
			.eq('store_id', store.storeId)

		if (updateError) {
			throw updateError
		}

		revalidatePath('/admin/drops')
		revalidatePath('/admin/products')
		return {
			error: false,
			message: 'Estado del drop actualizado',
		}
	} catch (error) {
		console.error('[advanceDropStatus]', error)
		return {
			error: true,
			message: 'No se pudo actualizar el estado del drop',
		}
	}
}
