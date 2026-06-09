export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export type Database = {
	__InternalSupabase: {
		PostgrestVersion: '14.1'
	}
	public: {
		Tables: {
			categories: {
				Row: {
					created_at: string
					description: string | null
					id: string
					image_url: string | null
					name: string
					slug: string
					store_id: string
					updated_at: string
				}
				Insert: {
					created_at?: string
					description?: string | null
					id?: string
					image_url?: string | null
					name: string
					slug: string
					store_id: string
					updated_at?: string
				}
				Update: {
					created_at?: string
					description?: string | null
					id?: string
					image_url?: string | null
					name?: string
					slug?: string
					store_id?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'categories_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			customers: {
				Row: {
					auth_user_id: string | null
					created_at: string
					deleted_at: string | null
					email: string
					first_name: string | null
					id: string
					last_name: string | null
					phone: string | null
					store_id: string
					total_spent: number
					updated_at: string
				}
				Insert: {
					auth_user_id?: string | null
					created_at?: string
					deleted_at?: string | null
					email: string
					first_name?: string | null
					id?: string
					last_name?: string | null
					phone?: string | null
					store_id: string
					total_spent?: number
					updated_at?: string
				}
				Update: {
					auth_user_id?: string | null
					created_at?: string
					deleted_at?: string | null
					email?: string
					first_name?: string | null
					id?: string
					last_name?: string | null
					phone?: string | null
					store_id?: string
					total_spent?: number
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'customers_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			daily_metrics: {
				Row: {
					date: string
					store_id: string
					total_orders: number
					total_sales: number
					total_views: number
					updated_at: string
				}
				Insert: {
					date?: string
					store_id: string
					total_orders?: number
					total_sales?: number
					total_views?: number
					updated_at?: string
				}
				Update: {
					date?: string
					store_id?: string
					total_orders?: number
					total_sales?: number
					total_views?: number
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'daily_metrics_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			drops: {
				Row: {
					cover_image: string | null
					created_at: string
					description: string | null
					end_time: string | null
					id: string
					name: string
					slug: string
					start_time: string
					status: string
					store_id: string
					updated_at: string
				}
				Insert: {
					cover_image?: string | null
					created_at?: string
					description?: string | null
					end_time?: string | null
					id?: string
					name: string
					slug: string
					start_time: string
					status?: string
					store_id: string
					updated_at?: string
				}
				Update: {
					cover_image?: string | null
					created_at?: string
					description?: string | null
					end_time?: string | null
					id?: string
					name?: string
					slug?: string
					start_time?: string
					status?: string
					store_id?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'drops_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			order_items: {
				Row: {
					id: string
					order_id: string
					product_name: string
					quantity: number
					total_price: number
					unit_price: number
					variant_details: string | null
					variant_id: string
				}
				Insert: {
					id?: string
					order_id: string
					product_name: string
					quantity: number
					total_price?: number
					unit_price: number
					variant_details?: string | null
					variant_id: string
				}
				Update: {
					id?: string
					order_id?: string
					product_name?: string
					quantity?: number
					total_price?: number
					unit_price?: number
					variant_details?: string | null
					variant_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'order_items_order_id_fkey'
						columns: ['order_id']
						isOneToOne: false
						referencedRelation: 'orders'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'order_items_variant_id_fkey'
						columns: ['variant_id']
						isOneToOne: false
						referencedRelation: 'product_variants'
						referencedColumns: ['id']
					},
				]
			}
			orders: {
				Row: {
					created_at: string
					customer_id: string
					id: string
					order_number: string
					shipping_address: Json | null
					status: string
					store_id: string
					total_amount: number
					updated_at: string
				}
				Insert: {
					created_at?: string
					customer_id: string
					id?: string
					order_number: string
					shipping_address?: Json | null
					status?: string
					store_id: string
					total_amount: number
					updated_at?: string
				}
				Update: {
					created_at?: string
					customer_id?: string
					id?: string
					order_number?: string
					shipping_address?: Json | null
					status?: string
					store_id?: string
					total_amount?: number
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'orders_customer_id_fkey'
						columns: ['customer_id']
						isOneToOne: false
						referencedRelation: 'customers'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'orders_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			product_images: {
				Row: {
					display_order: number
					id: string
					image_url: string
					product_id: string
				}
				Insert: {
					display_order?: number
					id?: string
					image_url: string
					product_id: string
				}
				Update: {
					display_order?: number
					id?: string
					image_url?: string
					product_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'product_images_product_id_fkey'
						columns: ['product_id']
						isOneToOne: false
						referencedRelation: 'products'
						referencedColumns: ['id']
					},
				]
			}
			product_option_values: {
				Row: {
					id: string
					option_id: string
					position: number
					value: string
				}
				Insert: {
					id?: string
					option_id: string
					position?: number
					value: string
				}
				Update: {
					id?: string
					option_id?: string
					position?: number
					value?: string
				}
				Relationships: [
					{
						foreignKeyName: 'product_option_values_option_id_fkey'
						columns: ['option_id']
						isOneToOne: false
						referencedRelation: 'product_options'
						referencedColumns: ['id']
					},
				]
			}
			product_options: {
				Row: {
					id: string
					name: string
					position: number
					product_id: string
				}
				Insert: {
					id?: string
					name: string
					position?: number
					product_id: string
				}
				Update: {
					id?: string
					name?: string
					position?: number
					product_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'product_options_product_id_fkey'
						columns: ['product_id']
						isOneToOne: false
						referencedRelation: 'products'
						referencedColumns: ['id']
					},
				]
			}
			product_variants: {
				Row: {
					combination_key: string
					deleted_at: string | null
					id: string
					image_url: string | null
					is_active: boolean
					low_stock_threshold: number
					price: number
					product_id: string
					reserved_stock: number
					sku: string | null
					stock_quantity: number
					track_inventory: boolean
					weight: number | null
				}
				Insert: {
					combination_key: string
					deleted_at?: string | null
					id?: string
					image_url?: string | null
					is_active?: boolean
					low_stock_threshold?: number
					price: number
					product_id: string
					reserved_stock?: number
					sku?: string | null
					stock_quantity?: number
					track_inventory?: boolean
					weight?: number | null
				}
				Update: {
					combination_key?: string
					deleted_at?: string | null
					id?: string
					image_url?: string | null
					is_active?: boolean
					low_stock_threshold?: number
					price?: number
					product_id?: string
					reserved_stock?: number
					sku?: string | null
					stock_quantity?: number
					track_inventory?: boolean
					weight?: number | null
				}
				Relationships: [
					{
						foreignKeyName: 'product_variants_product_id_fkey'
						columns: ['product_id']
						isOneToOne: false
						referencedRelation: 'products'
						referencedColumns: ['id']
					},
				]
			}
			product_views_daily: {
				Row: {
					date: string
					product_id: string
					store_id: string
					updated_at: string
					views: number
				}
				Insert: {
					date?: string
					product_id: string
					store_id: string
					updated_at?: string
					views?: number
				}
				Update: {
					date?: string
					product_id?: string
					store_id?: string
					updated_at?: string
					views?: number
				}
				Relationships: [
					{
						foreignKeyName: 'product_views_daily_product_id_fkey'
						columns: ['product_id']
						isOneToOne: false
						referencedRelation: 'products'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'product_views_daily_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			products: {
				Row: {
					base_price: number
					category_id: string | null
					compare_at_price: number | null
					created_at: string
					deleted_at: string | null
					description: string | null
					drop_id: string | null
					id: string
					is_customizable: boolean
					main_image: string
					name: string
					slug: string
					status: string
					store_id: string
					total_views: number
					updated_at: string
				}
				Insert: {
					base_price: number
					category_id?: string | null
					compare_at_price?: number | null
					created_at?: string
					deleted_at?: string | null
					description?: string | null
					drop_id?: string | null
					id?: string
					is_customizable?: boolean
					main_image: string
					name: string
					slug: string
					status?: string
					store_id: string
					total_views?: number
					updated_at?: string
				}
				Update: {
					base_price?: number
					category_id?: string | null
					compare_at_price?: number | null
					created_at?: string
					deleted_at?: string | null
					description?: string | null
					drop_id?: string | null
					id?: string
					is_customizable?: boolean
					main_image?: string
					name?: string
					slug?: string
					status?: string
					store_id?: string
					total_views?: number
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'products_category_id_fkey'
						columns: ['category_id']
						isOneToOne: false
						referencedRelation: 'categories'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'products_drop_id_fkey'
						columns: ['drop_id']
						isOneToOne: false
						referencedRelation: 'drops'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'products_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			site_config: {
				Row: {
					created_at: string
					description: string | null
					id: string
					is_active: boolean
					key: string
					store_id: string
					updated_at: string
					updated_by: string | null
					value: Json
					visibility: string
				}
				Insert: {
					created_at?: string
					description?: string | null
					id?: string
					is_active?: boolean
					key: string
					store_id: string
					updated_at?: string
					updated_by?: string | null
					value?: Json
					visibility?: string
				}
				Update: {
					created_at?: string
					description?: string | null
					id?: string
					is_active?: boolean
					key?: string
					store_id?: string
					updated_at?: string
					updated_by?: string | null
					value?: Json
					visibility?: string
				}
				Relationships: [
					{
						foreignKeyName: 'site_config_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			store_social_links: {
				Row: {
					created_at: string
					id: string
					is_active: boolean
					platform: string
					sort_order: number
					store_id: string
					updated_at: string
					value: string
				}
				Insert: {
					created_at?: string
					id?: string
					is_active?: boolean
					platform: string
					sort_order?: number
					store_id: string
					updated_at?: string
					value: string
				}
				Update: {
					created_at?: string
					id?: string
					is_active?: boolean
					platform?: string
					sort_order?: number
					store_id?: string
					updated_at?: string
					value?: string
				}
				Relationships: [
					{
						foreignKeyName: 'store_social_links_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			stores: {
				Row: {
					address: string | null
					created_at: string
					description: string | null
					founded_year: number | null
					id: string
					is_active: boolean
					name: string
					owner_id: string | null
					rut: string | null
					slug: string
					tagline: string | null
					updated_at: string
				}
				Insert: {
					address?: string | null
					created_at?: string
					description?: string | null
					founded_year?: number | null
					id?: string
					is_active?: boolean
					name: string
					owner_id?: string | null
					rut?: string | null
					slug: string
					tagline?: string | null
					updated_at?: string
				}
				Update: {
					address?: string | null
					created_at?: string
					description?: string | null
					founded_year?: number | null
					id?: string
					is_active?: boolean
					name?: string
					owner_id?: string | null
					rut?: string | null
					slug?: string
					tagline?: string | null
					updated_at?: string
				}
				Relationships: []
			}
			user_roles: {
				Row: {
					created_at: string
					role: string
					store_id: string
					user_id: string
				}
				Insert: {
					created_at?: string
					role: string
					store_id: string
					user_id: string
				}
				Update: {
					created_at?: string
					role?: string
					store_id?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'user_roles_store_id_fkey'
						columns: ['store_id']
						isOneToOne: false
						referencedRelation: 'stores'
						referencedColumns: ['id']
					},
				]
			}
			variant_option_values: {
				Row: {
					option_value_id: string
					variant_id: string
				}
				Insert: {
					option_value_id: string
					variant_id: string
				}
				Update: {
					option_value_id?: string
					variant_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'variant_option_values_option_value_id_fkey'
						columns: ['option_value_id']
						isOneToOne: false
						referencedRelation: 'product_option_values'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'variant_option_values_variant_id_fkey'
						columns: ['variant_id']
						isOneToOne: false
						referencedRelation: 'product_variants'
						referencedColumns: ['id']
					},
				]
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			increment_product_view: {
				Args: { p_product_id: string }
				Returns: undefined
			}
			is_store_admin: {
				Args: { p_store_id: string }
				Returns: boolean
			}
			next_order_number: {
				Args: Record<string, never>
				Returns: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never

export const Constants = {
	public: {
		Enums: {},
	},
} as const
