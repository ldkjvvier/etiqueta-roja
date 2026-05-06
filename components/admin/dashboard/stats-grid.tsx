'use client'

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Package,
	Tags,
	AlertTriangle,
	DollarSign,
	Layers,
	Ban,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface DashboardStats {
	productsCount: number
	categoriesCount: number
	totalStockItems: number
	totalInventoryValue: number
	lowStockCount: number
	outOfStockCount: number
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Total Productos
					</CardTitle>
					<Package className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{stats.productsCount}
					</div>
					<p className="text-xs text-muted-foreground">En catálogo</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Categorías
					</CardTitle>
					<Tags className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{stats.categoriesCount}
					</div>
					<p className="text-xs text-muted-foreground">Activas</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Valor del inventario
					</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatPrice(stats.totalInventoryValue)}
					</div>
					<p className="text-xs text-muted-foreground">
						Estimado (Precio x Stock)
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Total de ítems en stock
					</CardTitle>
					<Layers className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{stats.totalStockItems}
					</div>
					<p className="text-xs text-muted-foreground">
						Unidades totales
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Poco Stock
					</CardTitle>
					<AlertTriangle className="h-4 w-4 text-yellow-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-yellow-600">
						{stats.lowStockCount}
					</div>
					<p className="text-xs text-muted-foreground">
						Productos con menos de 5 unidades
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Agotados
					</CardTitle>
					<Ban className="h-4 w-4 text-red-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-red-600">
						{stats.outOfStockCount}
					</div>
					<p className="text-xs text-muted-foreground">
						Productos sin stock
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
