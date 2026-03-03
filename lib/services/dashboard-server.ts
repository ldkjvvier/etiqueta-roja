import {
	getDashboardMetrics,
	getRecentProducts as getRecentProductsV3,
} from '@/lib/services/analytics'

export async function getAdminDashboardBundle() {
	const [stats, recentRows] = await Promise.all([
		getDashboardMetrics(),
		getRecentProductsV3(5),
	])

	return {
		stats: {
			productsCount: stats.productsCount,
			categoriesCount: stats.categoriesCount,
			totalStockItems: stats.totalStockItems,
			totalInventoryValue: 0,
			lowStockCount: stats.lowStockCount,
			outOfStockCount: stats.outOfStockCount,
		},
		recentProducts: recentRows.map((row: any) => ({
			id: row.id,
			name: row.name,
			price: row.base_price,
			image: row.main_image,
			created_at: row.created_at,
		})),
		topViewed: stats.topProducts.map((product) => ({
			id: product.id,
			name: product.name,
			price: product.base_price,
			image: product.main_image,
			views: product.views,
		})),
	}
}

export async function getDashboardStats() {
	const stats = await getDashboardMetrics()

	return {
		productsCount: stats.productsCount,
		categoriesCount: stats.categoriesCount,
		totalStockItems: stats.totalStockItems,
		totalInventoryValue: 0,
		lowStockCount: stats.lowStockCount,
		outOfStockCount: stats.outOfStockCount,
	}
}

export async function getRecentProducts() {
	const rows = await getRecentProductsV3(5)
	return rows.map((row: any) => ({
		id: row.id,
		name: row.name,
		price: row.base_price,
		image: row.main_image,
		created_at: row.created_at,
	}))
}

export async function getTopViewedProducts() {
	const stats = await getDashboardMetrics()
	return stats.topProducts.map((product) => ({
		id: product.id,
		name: product.name,
		price: product.base_price,
		image: product.main_image,
		views: product.views,
	}))
}
