import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-screen bg-gray-50 text-foreground">
			<AdminSidebar />
			<main className="flex-1 overflow-y-auto p-8">{children}</main>
		</div>
	)
}
