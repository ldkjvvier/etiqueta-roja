export type { Database, Json } from '@/lib/supabase/types'
import type { Database } from '@/lib/supabase/types'

// ---------------------------------------------------------------------------
// Row aliases
// ---------------------------------------------------------------------------
export type Store = Database['public']['Tables']['stores']['Row']
export type Category =
	Database['public']['Tables']['categories']['Row']
export type Drop = Database['public']['Tables']['drops']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage =
	Database['public']['Tables']['product_images']['Row']
export type ProductOption =
	Database['public']['Tables']['product_options']['Row']
export type ProductOptionValue =
	Database['public']['Tables']['product_option_values']['Row']
export type ProductVariant =
	Database['public']['Tables']['product_variants']['Row']
export type VariantOptionValue =
	Database['public']['Tables']['variant_option_values']['Row']
export type Customer =
	Database['public']['Tables']['customers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem =
	Database['public']['Tables']['order_items']['Row']
export type DailyMetrics =
	Database['public']['Tables']['daily_metrics']['Row']
export type ProductViewsDaily =
	Database['public']['Tables']['product_views_daily']['Row']
export type SiteConfig =
	Database['public']['Tables']['site_config']['Row']
export type UserRole =
	Database['public']['Tables']['user_roles']['Row']

// ---------------------------------------------------------------------------
// Insert / Update aliases (excluding server-managed fields)
// ---------------------------------------------------------------------------
export type InsertProduct = Omit<
	Database['public']['Tables']['products']['Insert'],
	'created_at' | 'updated_at'
>
export type UpdateProduct = Omit<
	Database['public']['Tables']['products']['Update'],
	'id' | 'store_id' | 'created_at' | 'updated_at'
>

export type InsertOrder = Omit<
	Database['public']['Tables']['orders']['Insert'],
	'created_at'
>
export type UpdateOrder = Omit<
	Database['public']['Tables']['orders']['Update'],
	'id' | 'store_id' | 'created_at'
>

export type InsertOrderItem = Omit<
	Database['public']['Tables']['order_items']['Insert'],
	never
>

export type InsertCustomer = Omit<
	Database['public']['Tables']['customers']['Insert'],
	'created_at'
>
export type UpdateCustomer = Omit<
	Database['public']['Tables']['customers']['Update'],
	| 'id'
	| 'store_id'
	| 'auth_user_id'
	| 'total_spent'
	| 'deleted_at'
	| 'created_at'
>

// ---------------------------------------------------------------------------
// String literal enums
// ---------------------------------------------------------------------------
export type UserRoleValue = 'super_admin' | 'store_admin' | 'customer'
export type ProductStatus = 'draft' | 'active' | 'archived'
export type OrderStatus =
	| 'pending'
	| 'paid'
	| 'processing'
	| 'shipped'
	| 'delivered'
	| 'cancelled'
export type DropStatus = 'scheduled' | 'live' | 'ended'
export type SiteConfigVisibility = 'public' | 'private' | 'internal'

// ---------------------------------------------------------------------------
// Utility result types
// ---------------------------------------------------------------------------
export type DataResult<T> = { data: T | null; error: string | null }

export type PaginatedResult<T> = {
	data: T[]
	count: number
	page: number
	pageSize: number
	totalPages: number
	error: string | null
}

// ---------------------------------------------------------------------------
// Composite types for common query patterns
// ---------------------------------------------------------------------------
export type ProductWithVariants = Product & {
	product_variants: ProductVariant[]
}

export type ProductWithDetails = Product & {
	product_variants: (ProductVariant & {
		variant_option_values: VariantOptionValue[]
	})[]
	product_images: ProductImage[]
	product_options: (ProductOption & {
		product_option_values: ProductOptionValue[]
	})[]
	categories: Category | null
}

export type OrderWithItems = Order & {
	order_items: (OrderItem & {
		product_variants: ProductVariant | null
	})[]
	customers: Customer | null
}

export type TopProductRow = {
	product_id: string
	total_views: number
	name: string
	main_image: string
	base_price: number
}
