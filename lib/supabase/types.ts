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
