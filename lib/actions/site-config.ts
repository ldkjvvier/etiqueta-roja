'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminStoreContext } from '@/lib/services/admin-context'
import {
	PromoBannerConfig,
	ContactInfoConfig,
} from '@/lib/services/site-config-server'

export async function updatePromoBanner(
	prevState: any,
	formData: FormData,
) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	// Check auth
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	const message = formData.get('message') as string
	const link = formData.get('link') as string
	const isActive = formData.get('is_active') === 'on'
	const description = (formData.get('description') as string) || null

	const value: PromoBannerConfig = {
		message,
		link: link || null,
	}

	const { error } = await supabase.from('site_config').upsert(
		{
			store_id: store.id,
			key: 'promo_banner',
			value,
			description,
			is_active: isActive,
			visibility: 'public',
			updated_by: user.id,
			updated_at: new Date().toISOString(),
		} as any,
		{ onConflict: 'store_id,key' },
	)

	if (error) {
		console.error('Error updating promo banner:', error)
		return { message: 'Error updating promo banner', error: true }
	}

	revalidatePath('/', 'layout') // Revalidate everything
	return {
		message: 'Promo banner updated successfully',
		error: false,
	}
}

export async function updateContactInfo(
	prevState: any,
	formData: FormData,
) {
	const supabase = await createClient()
	const store = await getAdminStoreContext()

	// Check auth
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		return { message: 'Unauthorized', error: true }
	}

	const whatsapp = formData.get('whatsapp') as string
	const instagram = formData.get('instagram') as string
	const tiktok = formData.get('tiktok') as string
	const email = formData.get('email') as string
	const description = (formData.get('description') as string) || null

	const value: ContactInfoConfig = {
		whatsapp,
		instagram,
		tiktok,
		email,
	}

	const { error } = await supabase.from('site_config').upsert(
		{
			store_id: store.id,
			key: 'contact_info',
			value,
			description,
			is_active: true,
			visibility: 'public',
			updated_by: user.id,
			updated_at: new Date().toISOString(),
		} as any,
		{ onConflict: 'store_id,key' },
	)

	if (error) {
		console.error('Error updating contact info:', error)
		return { message: 'Error updating contact info', error: true }
	}

	revalidatePath('/', 'layout')
	return {
		message: 'Contact info updated successfully',
		error: false,
	}
}
