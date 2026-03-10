import { AdminSidebar } from '@/components/admin-sidebar'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreContext } from '@/lib/services/admin-context'

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
	await getAdminStoreContext()

	return (
		<div className="flex h-screen overflow-hidden bg-gray-50 text-foreground">
			<AdminSidebar />
			<main className="flex-1 overflow-y-auto p-8 bg-muted/40">
				{children}
			</main>
		</div>
	)
}
