'use server'

import {
	createProductV3,
	updateProductV3,
} from '@/lib/actions/products-admin'

function mapVariant(variant: any) {
	return {
		id: variant.id,
		size: variant.size,
		price:
			variant.price === '' || variant.price == null
				? undefined
				: Number(variant.price),
		stock_quantity: Number(variant.stock_quantity || 0),
		// reserved_stock omitted — managed by the system, not editable from the form
		low_stock_threshold: Number(variant.low_stock_threshold ?? 5),
		sku: variant.sku || null,
		weight:
			variant.weight === '' || variant.weight == null
				? null
				: Number(variant.weight),
		image_url: variant.image_url || null,
		track_inventory: Boolean(variant.track_inventory),
	}
}

export async function createProduct(formData: any) {
	return createProductV3({
		name: formData.name,
		description: formData.description,
		base_price: Number(formData.base_price ?? formData.price ?? 0),
		compare_at_price:
			formData.compare_at_price ?? formData.original_price ?? null,
		category_id: formData.category_id || null,
		drop_id: formData.drop_id || null,
		status: formData.status || 'draft',
		is_customizable: Boolean(formData.is_customizable),
		images: formData.images || [],
		variants: (formData.variants || []).map(mapVariant),
	})
}

export async function updateProduct(id: string, formData: any) {
	return updateProductV3(id, {
		name: formData.name,
		description: formData.description,
		base_price: Number(formData.base_price ?? formData.price ?? 0),
		compare_at_price:
			formData.compare_at_price ?? formData.original_price ?? null,
		category_id: formData.category_id || null,
		drop_id: formData.drop_id || null,
		status: formData.status || 'draft',
		is_customizable: Boolean(formData.is_customizable),
		images: formData.images || [],
		variants: (formData.variants || []).map(mapVariant),
	})
}
