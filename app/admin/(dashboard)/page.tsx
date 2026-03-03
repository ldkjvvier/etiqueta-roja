import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminDashboardBundle } from '@/lib/services/dashboard-server'
import { StatsGrid } from '@/components/admin/dashboard/stats-grid'
import { RecentProducts } from '@/components/admin/dashboard/recent-products'
import { TopProducts } from '@/components/admin/dashboard/top-products'

export default async function AdminDashboard() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/admin/login')
	}

	const { stats, recentProducts, topViewed } =
		await getAdminDashboardBundle()

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">
					Dashboard
				</h2>
				<div className="flex items-center space-x-2">
					{/* Add DatePicker here later if needed */}
				</div>
			</div>

			<StatsGrid stats={stats} />

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<div className="col-span-4">
					<RecentProducts products={recentProducts} />
				</div>
				<div className="col-span-3">
					<TopProducts products={topViewed} />
				</div>
			</div>
		</div>
	)
}
