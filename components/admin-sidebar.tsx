'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	Package,
	Settings,
	LogOut,
	Tags,
	Users,
	Receipt,
	Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const navItems = [
	{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/admin/products', label: 'Products', icon: Package },
	{ href: '/admin/drops', label: 'Drops', icon: Zap },
	{ href: '/admin/orders', label: 'Orders', icon: Receipt },
	{ href: '/admin/customers', label: 'Customers', icon: Users },
	{ href: '/admin/categories', label: 'Categories', icon: Tags },
	{ href: '/admin/config', label: 'Site Config', icon: Settings },
]

export function AdminSidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [logoutError, setLogoutError] = useState<string | null>(null)

	const handleLogout = async () => {
		setIsLoggingOut(true)
		setLogoutError(null)

		try {
			const supabase = createClient()
			const { error } = await supabase.auth.signOut()

			if (error) {
				setLogoutError(error.message)
				return
			}

			router.push('/admin/login')
			router.refresh()
		} catch (error) {
			console.error(error)
			setLogoutError('No se pudo cerrar la sesión del administrador.')
		} finally {
			setIsLoggingOut(false)
		}
	}

	return (
		<aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0">
			{/* Logo */}
			<div className="p-6 border-b border-gray-200">
				<Link href="/admin" className="block">
					<h1 className="font-mono text-lg font-bold tracking-tight text-foreground">
						ETIQUETA R<span className="text-[#E62727]">★</span>JA
					</h1>
					<p className="font-mono text-xs text-gray-500 mt-1">
						// ADMIN PANEL
					</p>
				</Link>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-4">
				<ul className="space-y-1">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== '/admin' &&
								pathname.startsWith(item.href))
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={cn(
										'flex items-center gap-3 px-4 py-3 font-mono text-sm border transition-colors',
										isActive
											? 'bg-black text-white border-black'
											: 'border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-black',
									)}
									aria-current={isActive ? 'page' : undefined}
								>
									<item.icon className="w-4 h-4" />
									{item.label}
								</Link>
							</li>
						)
					})}
				</ul>
			</nav>

			{/* Logout */}
			<div className="p-4 border-t border-gray-200">
				<Button
					type="button"
					variant="ghost"
					onClick={handleLogout}
					disabled={isLoggingOut}
					aria-label={
						isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'
					}
					aria-live="polite"
					aria-busy={isLoggingOut}
					className="flex w-full items-center justify-start gap-3 px-4 py-3 font-mono text-sm text-gray-500 hover:text-black transition-colors"
				>
						<LogOut className="w-4 h-4" />
						{isLoggingOut ? 'Cerrando sesión...' : 'Logout'}
				</Button>
				{logoutError ? (
					<p className="mt-2 text-xs text-red-600" role="alert">
						{logoutError}
					</p>
				) : null}
			</div>
		</aside>
	)
}
