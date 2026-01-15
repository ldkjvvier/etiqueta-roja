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
			products: {
				Row: {
					id: string
					created_at: string
					name: string
					price: number
					original_price: number | null
					image: string
					images: string[]
					sizes: string[]
					stock_status: string
					category: string
					description: string | null
				}
				Insert: {
					id?: string
					created_at?: string
					name: string
					price: number
					original_price?: number | null
					image: string
					images?: string[]
					sizes?: string[]
					stock_status?: string
					category?: string
					description?: string | null
				}
				Update: {
					id?: string
					created_at?: string
					name?: string
					price?: number
					original_price?: number | null
					image?: string
					images?: string[]
					sizes?: string[]
					stock_status?: string
					category?: string
					description?: string | null
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
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}
