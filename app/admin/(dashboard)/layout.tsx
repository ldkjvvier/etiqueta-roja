import { AdminSidebar } from '@/components/admin-sidebar'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/data/admin-context'

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

	// Ensures store context resolves before rendering protected admin routes.
	try {
		await getAdminStoreContext()
	} catch (error) {
		if (error instanceof Error && isAdminAccessError(error)) {
			redirect(buildUnauthorizedRedirect(error))
		}

		throw error
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
