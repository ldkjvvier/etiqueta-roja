import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

export type HeroDropStatus = 'scheduled' | 'live' | 'ended'

export interface HeroLinkedDropSummary {
	status: HeroDropStatus
	start_time: string
	end_time: string | null
}

function resolveEffectiveDropStatus(
	status: HeroDropStatus,
	startTimeRaw: string,
	endTimeRaw: string | null,
): HeroDropStatus {
	const now = Date.now()
	const startTime = new Date(startTimeRaw).getTime()
	const endTime = endTimeRaw ? new Date(endTimeRaw).getTime() : null

	if (!Number.isNaN(startTime)) {
		if (now < startTime) {
			return 'scheduled'
		}

		if (endTime && !Number.isNaN(endTime) && now >= endTime) {
			return 'ended'
		}

		return 'live'
	}

	return status
}

const getLinkedDropSummaryByStore = cache(
	async (
		storeId: string,
		linkedDropId: string,
	): Promise<HeroLinkedDropSummary | null> => {
		const supabase = await createClient()
		const db = supabase as any

		const { data, error } = await db
			.from('drops')
			.select('status,start_time,end_time')
			.eq('store_id', storeId)
			.eq('id', linkedDropId)
			.maybeSingle()

		if (error || !data) {
			return null
		}

		const status = data.status as HeroDropStatus
		if (
			status !== 'scheduled' &&
			status !== 'live' &&
			status !== 'ended'
		) {
			return null
		}

		const startTime = String(data.start_time || '')
		const endTime = data.end_time ? String(data.end_time) : null

		return {
			status: resolveEffectiveDropStatus(status, startTime, endTime),
			start_time: startTime,
			end_time: endTime,
		}
	},
)

export async function getHeroLinkedDropSummary(
	linkedDropId?: string,
): Promise<HeroLinkedDropSummary | null> {
	if (!linkedDropId) {
		return null
	}

	try {
		const store = await getAdminStoreContext()
		return getLinkedDropSummaryByStore(store.id, linkedDropId)
	} catch {
		return null
	}
}
