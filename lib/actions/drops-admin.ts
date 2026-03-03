'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/services/admin-context'

const DROP_STATUS_FLOW: Record<
	'scheduled' | 'live' | 'ended',
	'scheduled' | 'live' | 'ended'
> = {
	scheduled: 'live',
	live: 'ended',
	ended: 'ended',
}

export async function advanceDropStatus(formData: FormData) {
	const dropId = String(formData.get('dropId') || '')
	if (!dropId) return

	const supabase = await createClient()
	const db = supabase as any
	const store = await getAdminStoreContext()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return

	const { data: drop } = await db
		.from('drops')
		.select('id,status,start_time,end_time')
		.eq('id', dropId)
		.eq('store_id', store.id)
		.maybeSingle()

	if (!drop) return

	const currentStatus = drop.status as 'scheduled' | 'live' | 'ended'
	const nextStatus = DROP_STATUS_FLOW[currentStatus]

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

	await db
		.from('drops')
		.update(updates)
		.eq('id', dropId)
		.eq('store_id', store.id)

	revalidatePath('/admin/drops')
	revalidatePath('/admin/products')
}
