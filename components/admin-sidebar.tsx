'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	LayoutDashboard,
	Package,
	Settings,
	LogOut,
	Tags,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
	{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/admin/products', label: 'Products', icon: Package },
	{ href: '/admin/categories', label: 'Categories', icon: Tags },
	{ href: '/admin/config', label: 'Site Config', icon: Settings },
]

export function AdminSidebar() {
	const pathname = usePathname()

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
						const isActive = pathname === item.href
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
				<form action="/auth/signout" method="post">
					{/* Note: In a real implementation we might use a server action or client handler for signOut, 
             the provided snippets used a form action in the page.tsx. 
             For now, I'll keep the UI link as requested but it might need func. 
             The user code had a Link to '/'. I will stick to user request. */}
					<Link
						href="/"
						className="flex items-center gap-3 px-4 py-3 font-mono text-sm text-gray-500 hover:text-black transition-colors"
					>
						<LogOut className="w-4 h-4" />
						Logout
					</Link>
				</form>
			</div>
		</aside>
	)
}
