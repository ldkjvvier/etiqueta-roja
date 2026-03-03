export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export interface Database {
	public: {
		Tables: {
			stores: {
				Row: {
					id: string
					name: string
					slug: string
					is_active: boolean | null
					created_at: string | null
				}
				Insert: {
					id?: string
					name: string
					slug: string
					is_active?: boolean | null
					created_at?: string | null
				}
				Update: {
					id?: string
					name?: string
					slug?: string
					is_active?: boolean | null
					created_at?: string | null
				}
			}
			user_roles: {
				Row: {
					user_id: string
					store_id: string
					role: 'super_admin' | 'store_admin' | 'customer'
				}
				Insert: {
					user_id: string
					store_id: string
					role: 'super_admin' | 'store_admin' | 'customer'
				}
				Update: {
					user_id?: string
					store_id?: string
					role?: 'super_admin' | 'store_admin' | 'customer'
				}
			}
			categories: {
				Row: {
					id: string
					store_id: string | null
					name: string
					slug: string
					description: string | null
					image_url: string | null
					created_at: string | null
				}
				Insert: {
					id?: string
					store_id?: string | null
					name: string
					slug: string
					description?: string | null
					image_url?: string | null
					created_at?: string | null
				}
				Update: {
					id?: string
					store_id?: string | null
					name?: string
					slug?: string
					description?: string | null
					image_url?: string | null
					created_at?: string | null
				}
			}
			drops: {
				Row: {
					id: string
					store_id: string | null
					name: string
					slug: string
					description: string | null
					cover_image: string | null
					start_time: string
					end_time: string | null
					status: 'scheduled' | 'live' | 'ended' | null
					created_at: string | null
				}
				Insert: {
					id?: string
					store_id?: string | null
					name: string
					slug: string
					description?: string | null
					cover_image?: string | null
					start_time: string
					end_time?: string | null
					status?: 'scheduled' | 'live' | 'ended' | null
					created_at?: string | null
				}
				Update: {
					id?: string
					store_id?: string | null
					name?: string
					slug?: string
					description?: string | null
					cover_image?: string | null
					start_time?: string
					end_time?: string | null
					status?: 'scheduled' | 'live' | 'ended' | null
					created_at?: string | null
				}
			}
			products: {
				Row: {
					id: string
					store_id: string | null
					category_id: string | null
					drop_id: string | null
					name: string
					slug: string
					description: string | null
					base_price: number
					compare_at_price: number | null
					main_image: string
					status: 'draft' | 'active' | 'archived' | null
					is_customizable: boolean | null
					total_views: number | null
					deleted_at: string | null
					created_at: string | null
					updated_at: string | null
				}
				Insert: {
					id?: string
					store_id?: string | null
					category_id?: string | null
					drop_id?: string | null
					name: string
					slug: string
					description?: string | null
					base_price: number
					compare_at_price?: number | null
					main_image: string
					status?: 'draft' | 'active' | 'archived' | null
					is_customizable?: boolean | null
					total_views?: number | null
					deleted_at?: string | null
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					id?: string
					store_id?: string | null
					category_id?: string | null
					drop_id?: string | null
					name?: string
					slug?: string
					description?: string | null
					base_price?: number
					compare_at_price?: number | null
					main_image?: string
					status?: 'draft' | 'active' | 'archived' | null
					is_customizable?: boolean | null
					total_views?: number | null
					deleted_at?: string | null
					created_at?: string | null
					updated_at?: string | null
				}
			}
			product_images: {
				Row: {
					id: string
					product_id: string | null
					image_url: string
					display_order: number | null
				}
				Insert: {
					id?: string
					product_id?: string | null
					image_url: string
					display_order?: number | null
				}
				Update: {
					id?: string
					product_id?: string | null
					image_url?: string
					display_order?: number | null
				}
			}
			product_options: {
				Row: {
					id: string
					product_id: string | null
					name: string
					position: number | null
				}
				Insert: {
					id?: string
					product_id?: string | null
					name: string
					position?: number | null
				}
				Update: {
					id?: string
					product_id?: string | null
					name?: string
					position?: number | null
				}
			}
			product_option_values: {
				Row: {
					id: string
					option_id: string | null
					value: string
					position: number | null
				}
				Insert: {
					id?: string
					option_id?: string | null
					value: string
					position?: number | null
				}
				Update: {
					id?: string
					option_id?: string | null
					value?: string
					position?: number | null
				}
			}
			product_variants: {
				Row: {
					id: string
					product_id: string | null
					sku: string | null
					combination_key: string
					price: number | null
					stock_quantity: number | null
					reserved_stock: number | null
					low_stock_threshold: number | null
					track_inventory: boolean | null
					weight: number | null
					image_url: string | null
					is_active: boolean | null
					deleted_at: string | null
				}
				Insert: {
					id?: string
					product_id?: string | null
					sku?: string | null
					combination_key: string
					price?: number | null
					stock_quantity?: number | null
					reserved_stock?: number | null
					low_stock_threshold?: number | null
					track_inventory?: boolean | null
					weight?: number | null
					image_url?: string | null
					is_active?: boolean | null
					deleted_at?: string | null
				}
				Update: {
					id?: string
					product_id?: string | null
					sku?: string | null
					combination_key?: string
					price?: number | null
					stock_quantity?: number | null
					reserved_stock?: number | null
					low_stock_threshold?: number | null
					track_inventory?: boolean | null
					weight?: number | null
					image_url?: string | null
					is_active?: boolean | null
					deleted_at?: string | null
				}
			}
			variant_option_values: {
				Row: {
					variant_id: string
					option_value_id: string
				}
				Insert: {
					variant_id: string
					option_value_id: string
				}
				Update: {
					variant_id?: string
					option_value_id?: string
				}
			}
			customers: {
				Row: {
					id: string
					store_id: string | null
					auth_user_id: string | null
					email: string
					first_name: string | null
					last_name: string | null
					phone: string | null
					total_spent: number | null
					deleted_at: string | null
					created_at: string | null
				}
				Insert: {
					id?: string
					store_id?: string | null
					auth_user_id?: string | null
					email: string
					first_name?: string | null
					last_name?: string | null
					phone?: string | null
					total_spent?: number | null
					deleted_at?: string | null
					created_at?: string | null
				}
				Update: {
					id?: string
					store_id?: string | null
					auth_user_id?: string | null
					email?: string
					first_name?: string | null
					last_name?: string | null
					phone?: string | null
					total_spent?: number | null
					deleted_at?: string | null
					created_at?: string | null
				}
			}
			orders: {
				Row: {
					id: string
					store_id: string | null
					customer_id: string | null
					order_number: string
					status:
						| 'pending'
						| 'paid'
						| 'processing'
						| 'shipped'
						| 'delivered'
						| 'cancelled'
						| null
					total_amount: number
					shipping_address: Json | null
					created_at: string | null
				}
				Insert: {
					id?: string
					store_id?: string | null
					customer_id?: string | null
					order_number: string
					status?:
						| 'pending'
						| 'paid'
						| 'processing'
						| 'shipped'
						| 'delivered'
						| 'cancelled'
						| null
					total_amount: number
					shipping_address?: Json | null
					created_at?: string | null
				}
				Update: {
					id?: string
					store_id?: string | null
					customer_id?: string | null
					order_number?: string
					status?:
						| 'pending'
						| 'paid'
						| 'processing'
						| 'shipped'
						| 'delivered'
						| 'cancelled'
						| null
					total_amount?: number
					shipping_address?: Json | null
					created_at?: string | null
				}
			}
			order_items: {
				Row: {
					id: string
					order_id: string | null
					variant_id: string | null
					product_name: string
					variant_details: string | null
					quantity: number
					unit_price: number
				}
				Insert: {
					id?: string
					order_id?: string | null
					variant_id?: string | null
					product_name: string
					variant_details?: string | null
					quantity: number
					unit_price: number
				}
				Update: {
					id?: string
					order_id?: string | null
					variant_id?: string | null
					product_name?: string
					variant_details?: string | null
					quantity?: number
					unit_price?: number
				}
			}
			product_views_daily: {
				Row: {
					store_id: string
					product_id: string
					date: string
					views: number | null
				}
				Insert: {
					store_id: string
					product_id: string
					date?: string
					views?: number | null
				}
				Update: {
					store_id?: string
					product_id?: string
					date?: string
					views?: number | null
				}
			}
			daily_metrics: {
				Row: {
					store_id: string
					date: string
					total_views: number | null
					total_sales: number | null
					total_orders: number | null
				}
				Insert: {
					store_id: string
					date?: string
					total_views?: number | null
					total_sales?: number | null
					total_orders?: number | null
				}
				Update: {
					store_id?: string
					date?: string
					total_views?: number | null
					total_sales?: number | null
					total_orders?: number | null
				}
			}
			site_config: {
				Row: {
					id: string
					store_id: string
					key: string
					value: Json
					is_active: boolean
					visibility: 'public' | 'private' | 'internal'
					description: string | null
					updated_by: string | null
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					store_id: string
					key: string
					value?: Json
					is_active?: boolean
					visibility?: 'public' | 'private' | 'internal'
					description?: string | null
					updated_by?: string | null
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					store_id?: string
					key?: string
					value?: Json
					is_active?: boolean
					visibility?: 'public' | 'private' | 'internal'
					description?: string | null
					updated_by?: string | null
					created_at?: string
					updated_at?: string
				}
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			increment_product_view: {
				Args: {
					p_product_id: string
				}
				Returns: void
			}
			is_store_admin: {
				Args: {
					p_store_id: string
				}
				Returns: boolean
			}
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}
