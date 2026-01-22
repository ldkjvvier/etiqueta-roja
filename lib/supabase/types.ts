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
			categories: {
				Row: {
					id: string
					created_at: string
					name: string
					slug: string
					description: string | null
					image: string | null
				}
				Insert: {
					id?: string
					created_at?: string
					name: string
					slug: string
					description?: string | null
					image?: string | null
				}
				Update: {
					id?: string
					created_at?: string
					name?: string
					slug?: string
					description?: string | null
					image?: string | null
				}
			}
			product_variants: {
				Row: {
					id: string
					product_id: string
					size: string
					stock_quantity: number
					sku: string | null
				}
				Insert: {
					id?: string
					product_id: string
					size: string
					stock_quantity?: number
					sku?: string | null
				}
				Update: {
					id?: string
					product_id?: string
					size?: string
					stock_quantity?: number
					sku?: string | null
				}
			}
			products: {
				Row: {
					id: string
					created_at: string
					name: string
					price: number
					original_price: number | null
					image: string
					images: string[]
					description: string | null
					category_id: string | null
				}
				Insert: {
					id?: string
					created_at?: string
					name: string
					price: number
					original_price?: number | null
					image: string
					images?: string[]
					description?: string | null
					category_id?: string | null
				}
				Update: {
					id?: string
					created_at?: string
					name?: string
					price?: number
					original_price?: number | null
					image?: string
					images?: string[]
					description?: string | null
					category_id?: string | null
				}
				Relationships: []
			}
			site_config: {
				Row: {
					id: string
					key: string
					value: Json // Using the Json type defined above
					is_active: boolean
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					key: string
					value: Json
					is_active?: boolean
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					key?: string
					value?: Json
					is_active?: boolean
					created_at?: string
					updated_at?: string
				}
				Relationships: []
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
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}
