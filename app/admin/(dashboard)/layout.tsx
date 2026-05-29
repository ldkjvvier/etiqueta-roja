import { AdminSidebar } from '@/components/admin-sidebar'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function isAdminAccessError(error: unknown) {
	if (!(error instanceof Error)) return false
	return (
		error.message === 'Unauthorized' ||
		error.message.includes('No admin access')
	)
}

function buildUnauthorizedRedirect(error: Error) {
	const params = new URLSearchParams()

	if (error.message.includes('No admin access')) {
		params.set('reason', 'missing-role')

		const preferredSlug =
			process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG?.trim()
		if (preferredSlug) {
			params.set('store', preferredSlug)
		}
	} else {
		params.set('reason', 'unauthorized')
	}

	return `/admin/login?${params.toString()}`
}

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/admin/login')
	}

	const storeId = process.env.NEXT_PUBLIC_STORE_ID?.trim()
	if (!storeId) {
		throw new Error('Missing NEXT_PUBLIC_STORE_ID')
	}

	// Check admin access here so we can redirect back to login with a reason
	// instead of silently bouncing the user after a successful sign-in.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const db = supabase as any
	const { data: role, error: roleError } = await db
		.from('user_roles')
		.select('role')
		.eq('user_id', user.id)
		.eq('store_id', storeId)
		.in('role', ['super_admin', 'store_admin'])
		.maybeSingle()

	if (roleError) {
		console.error('[AdminLayout.roleCheck]', roleError)
		redirect(buildUnauthorizedRedirect(new Error('Unauthorized')))
	}

	if (!role) {
		redirect(
			buildUnauthorizedRedirect(
				new Error(`No admin access for store ${storeId}`),
			),
		)
	}

	return (
		<div className="flex h-screen overflow-hidden bg-gray-50 text-foreground">
			<AdminSidebar />
			<main className="flex-1 overflow-y-auto p-8 bg-muted/40">
				{children}
			</main>
		</div>
	)
}
