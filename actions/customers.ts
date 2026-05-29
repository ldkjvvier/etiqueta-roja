'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { updateCustomerProfile } from '@/lib/data/customers'

type ActionResult<T = undefined> = {
	success: boolean
	data?: T
	error?: string
}

const profileSchema = z.object({
	first_name: z.string().min(1).max(100).nullable().optional(),
	last_name: z.string().min(1).max(100).nullable().optional(),
	phone: z.string().min(1).max(50).nullable().optional(),
})

export async function updateProfile(
	customerId: string,
	payload: z.infer<typeof profileSchema>,
): Promise<ActionResult> {
	if (!customerId)
		return { success: false, error: 'ID de cliente requerido' }

	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return { success: false, error: 'Autenticación requerida' }
	}

	const parsed = profileSchema.safeParse(payload)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
		}
	}

	const { error } = await updateCustomerProfile(
		customerId,
		parsed.data,
		user.id,
	)
	if (error) return { success: false, error }

	return { success: true }
}
